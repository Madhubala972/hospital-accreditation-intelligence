const fs = require('fs');
const path = require('path');
const HospitalMetric = require('../models/HospitalMetric');
const { getMongoStatus } = require('../config/db');
const logger = require('../utils/logger');
const externalDataService = require('../services/externalDataService');

const fallbackMetricsPath = path.join(__dirname, '../../database/sample_metrics.json');

const getFallbackMetrics = () => {
  try {
    if (fs.existsSync(fallbackMetricsPath)) {
      return JSON.parse(fs.readFileSync(fallbackMetricsPath, 'utf8'));
    }
  } catch (e) {
    logger.error('Error loading fallback metrics:', e.message);
  }
  return [];
};

const saveFallbackMetrics = (data) => {
  try {
    fs.writeFileSync(fallbackMetricsPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    logger.error('Error saving fallback metrics:', e.message);
  }
};

// @route GET /api/metrics
const getAllMetrics = async (req, res) => {
  try {
    let metrics = [];
    if (getMongoStatus()) {
      try {
        metrics = await HospitalMetric.find().sort({ department: 1 }).lean();
      } catch (e) {}
    }
    if (!metrics || metrics.length === 0) {
      metrics = getFallbackMetrics();
    }
    res.json({ success: true, count: metrics.length, metrics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/metrics/:department
const getDepartmentMetric = async (req, res) => {
  try {
    const { department } = req.params;
    let metric = null;
    if (getMongoStatus()) {
      try {
        metric = await HospitalMetric.findOne({ department: new RegExp(`^${department}$`, 'i') }).lean();
      } catch (e) {}
    }
    if (!metric) {
      const all = getFallbackMetrics();
      metric = all.find((m) => m.department.toLowerCase() === department.toLowerCase()) || all[0];
    }
    res.json({ success: true, metric });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/metrics or PUT /api/metrics/:department
const saveDepartmentMetric = async (req, res) => {
  try {
    const {
      department = 'ICU',
      occupancyRate,
      bedCapacity,
      occupiedBeds,
      avgWaitingTime,
      infectionRate,
      staffingLevel,
      nurseToPatientRatio,
      incidentCount,
      pathwayConformance,
      medicationErrorRate,
      readmissionRate30Day,
      benchmarkGap,
    } = req.body;

    const deptName = req.params.department || department;

    // Calculate updated risk prediction using ML service
    const mlRisk = await externalDataService.predictRisk({
      department: deptName,
      occupancyRate: Number(occupancyRate || 85),
      avgWaitingTime: Number(avgWaitingTime || 30),
      infectionRate: Number(infectionRate || 2.0),
      pathwayConformance: Number(pathwayConformance || 80),
      staffingLevel: Number(staffingLevel || 85),
      incidentCount: Number(incidentCount || 2),
      benchmarkGap: Number(benchmarkGap || 0),
    });

    const metricPayload = {
      department: deptName,
      occupancyRate: Number(occupancyRate || 80),
      bedCapacity: Number(bedCapacity || 30),
      occupiedBeds: Number(occupiedBeds || Math.round((Number(bedCapacity || 30) * Number(occupancyRate || 80)) / 100)),
      avgWaitingTime: Number(avgWaitingTime || 30),
      infectionRate: Number(infectionRate || 2.0),
      staffingLevel: Number(staffingLevel || 85),
      nurseToPatientRatio: Number(nurseToPatientRatio || 0.33),
      incidentCount: Number(incidentCount || 0),
      pathwayConformance: Number(pathwayConformance || 85),
      medicationErrorRate: Number(medicationErrorRate || 1.5),
      readmissionRate30Day: Number(readmissionRate30Day || 5.0),
      benchmarkGap: Number(benchmarkGap || 0),
      riskScore: mlRisk.riskScore || 50,
      riskCategory: mlRisk.riskCategory || 'MODERATE',
      timestamp: new Date(),
    };

    if (getMongoStatus()) {
      try {
        await HospitalMetric.findOneAndUpdate(
          { department: deptName },
          { $set: metricPayload },
          { upsert: true, new: true }
        );
      } catch (e) {
        logger.warn(`Mongo metric update warning: ${e.message}`);
      }
    }

    // Update fallback JSON
    const all = getFallbackMetrics();
    const existingIdx = all.findIndex((m) => m.department.toLowerCase() === deptName.toLowerCase());
    if (existingIdx >= 0) {
      all[existingIdx] = { ...all[existingIdx], ...metricPayload };
    } else {
      all.push(metricPayload);
    }
    saveFallbackMetrics(all);

    logger.info(`[Data Entry] Saved metric updates for ${deptName}: Occupancy=${metricPayload.occupancyRate}%, Conformance=${metricPayload.pathwayConformance}%, RiskScore=${metricPayload.riskScore}`);

    res.json({
      success: true,
      message: `Operational telemetry for ${deptName} saved successfully!`,
      metric: metricPayload,
    });
  } catch (err) {
    logger.error('Error saving metric:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/metrics/summary/kpis
const getKPIs = async (req, res) => {
  try {
    let all = [];
    if (getMongoStatus()) {
      try {
        all = await HospitalMetric.find().lean();
      } catch (e) {}
    }
    if (!all || all.length === 0) {
      all = getFallbackMetrics();
    }
    const totalBeds = all.reduce((sum, m) => sum + (m.bedCapacity || 0), 0);
    const occupiedBeds = all.reduce((sum, m) => sum + (m.occupiedBeds || 0), 0);
    const avgOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 84;
    const avgWait = all.length ? Math.round(all.reduce((sum, m) => sum + (m.avgWaitingTime || 0), 0) / all.length) : 35;
    const avgConformance = all.length ? Math.round(all.reduce((sum, m) => sum + (m.pathwayConformance || 0), 0) / all.length) : 80;
    const avgInfection = all.length ? (all.reduce((sum, m) => sum + (m.infectionRate || 0), 0) / all.length).toFixed(1) : '2.0';

    res.json({
      success: true,
      kpis: {
        totalBeds,
        occupiedBeds,
        averageOccupancyRate: avgOccupancy,
        averageWaitingTimeMinutes: avgWait,
        averagePathwayConformance: avgConformance,
        averageInfectionRate: Number(avgInfection),
        hospitalQualityScore: 86.4,
        activeDepartments: all.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/metrics/trends/historical
const getHistoricalTrends = async (req, res) => {
  try {
    const months = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026'];
    const trends = months.map((month, idx) => ({
      month,
      pathwayConformance: [84, 82, 79, 76, 75, 74.2][idx],
      waitingTimeMinutes: [32, 35, 38, 42, 45, 48.5][idx],
      infectionRate: [2.1, 2.3, 2.8, 3.2, 3.5, 3.8][idx],
      occupancyRate: [78, 81, 85, 89, 92, 94.0][idx],
      overallRiskScore: [42, 48, 56, 68, 74, 82.5][idx],
    }));

    res.json({ success: true, trends });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllMetrics,
  getDepartmentMetric,
  saveDepartmentMetric,
  getKPIs,
  getHistoricalTrends,
};
