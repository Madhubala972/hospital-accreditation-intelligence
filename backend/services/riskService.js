const fs = require('fs');
const path = require('path');
const externalDataService = require('./externalDataService');
const benchmarkService = require('./benchmarkService');
const HospitalMetric = require('../models/HospitalMetric');
const AccreditationStandard = require('../models/AccreditationStandard');
const { getMongoStatus } = require('../config/db');
const logger = require('../utils/logger');

class RiskService {
  constructor() {
    this.fallbackMetricsPath = path.join(__dirname, '../../database/sample_metrics.json');
    this.fallbackStandardsPath = path.join(__dirname, '../../database/accreditation_standards.json');
  }

  getFallbackMetrics() {
    try {
      if (fs.existsSync(this.fallbackMetricsPath)) {
        return JSON.parse(fs.readFileSync(this.fallbackMetricsPath, 'utf8'));
      }
    } catch (e) {
      logger.error('Error reading fallback metrics:', e.message);
    }
    return [];
  }

  getFallbackStandards() {
    try {
      if (fs.existsSync(this.fallbackStandardsPath)) {
        return JSON.parse(fs.readFileSync(this.fallbackStandardsPath, 'utf8'));
      }
    } catch (e) {
      logger.error('Error reading fallback standards:', e.message);
    }
    return [];
  }

  async calculateDepartmentRisk(department = 'ICU') {
    let metric = null;

    if (getMongoStatus()) {
      try {
        metric = await HospitalMetric.findOne({ department }).sort({ timestamp: -1 }).lean();
      } catch (e) {
        logger.warn(`Error reading metric for ${department}: ${e.message}`);
      }
    }

    if (!metric) {
      const allMetrics = this.getFallbackMetrics();
      metric = allMetrics.find((m) => m.department.toLowerCase() === department.toLowerCase()) || allMetrics[0] || {
        department,
        occupancyRate: 85,
        avgWaitingTime: 40,
        infectionRate: 2.5,
        pathwayConformance: 75,
        staffingLevel: 82,
        incidentCount: 4,
        benchmarkGap: -5,
      };
    }

    // 1. ML Model Prediction
    const mlRisk = await externalDataService.predictRisk({
      department,
      occupancyRate: metric.occupancyRate,
      avgWaitingTime: metric.avgWaitingTime,
      infectionRate: metric.infectionRate,
      pathwayConformance: metric.pathwayConformance,
      staffingLevel: metric.staffingLevel,
      incidentCount: metric.incidentCount,
      benchmarkGap: metric.benchmarkGap,
    });

    // 2. Anomaly Detection
    const anomalyResult = await externalDataService.detectAnomaly({
      department,
      occupancyRate: metric.occupancyRate,
      avgWaitingTime: metric.avgWaitingTime,
      infectionRate: metric.infectionRate,
      pathwayConformance: metric.pathwayConformance,
      staffingLevel: metric.staffingLevel,
      incidentCount: metric.incidentCount,
    });

    // 3. Benchmark Data
    const benchData = await benchmarkService.getBenchmarks(department);

    // 4. Standards Non-Compliance Check
    let standards = [];
    if (getMongoStatus()) {
      try {
        standards = await AccreditationStandard.find({
          $or: [{ department }, { department: 'All' }],
        }).lean();
      } catch (e) {
        // fallback
      }
    }
    if (!standards || standards.length === 0) {
      standards = this.getFallbackStandards().filter(
        (s) => s.department === department || s.department === 'All'
      );
    }

    const nonCompliantStandards = standards.filter(
      (s) => s.complianceStatus === 'Non-Compliant' || s.complianceStatus === 'Sub-Optimal'
    );

    // 5. Composite Risk Engine Calculation (0 - 100)
    // Weights:
    // - ML Score: 25%
    // - Conformance Gap: 25%
    // - Anomaly Presence: 15%
    // - Benchmark Gap: 15%
    // - Standards Non-compliance: 20%
    const mlScoreComponent = (mlRisk.riskScore || 50) * 0.25;
    const conformanceGap = Math.max(0, 90.0 - metric.pathwayConformance);
    const conformanceComponent = Math.min(100, conformanceGap * 3.5) * 0.25;
    const anomalyComponent = (anomalyResult.hasAnomaly ? Math.min(100, anomalyResult.anomalyCount * 30) : 10) * 0.15;
    const benchmarkComponent = (metric.benchmarkGap < 0 ? Math.min(100, Math.abs(metric.benchmarkGap) * 6) : 5) * 0.15;
    const standardsComponent = (nonCompliantStandards.length > 0 ? Math.min(100, nonCompliantStandards.length * 25) : 10) * 0.20;

    const rawCompositeScore = mlScoreComponent + conformanceComponent + anomalyComponent + benchmarkComponent + standardsComponent;
    const compositeRiskScore = Math.min(99, Math.max(5, roundNum(rawCompositeScore, 1)));

    let riskCategory = 'LOW';
    if (compositeRiskScore > 80.0) riskCategory = 'CRITICAL';
    else if (compositeRiskScore > 60.0) riskCategory = 'HIGH';
    else if (compositeRiskScore > 30.0) riskCategory = 'MODERATE';

    // Build contributing factors
    const factors = mlRisk.topContributors || [];

    // Build recommended actions
    const recommendations = [];
    if (metric.pathwayConformance < 80) {
      recommendations.push(`Enforce mandatory verification checkpoints in ${department} to raise pathway conformance above 85%.`);
    }
    if (metric.occupancyRate > 90) {
      recommendations.push(`Initiate immediate bed turnover protocols and alert triage coordinators to relieve ${department} capacity bottleneck.`);
    }
    if (metric.infectionRate > 2.5) {
      recommendations.push(`Mandate central line insertion bundle re-certification and enhance sterilization auditing in ${department}.`);
    }
    if (metric.avgWaitingTime > 40) {
      recommendations.push(`Augment fast-track triage staffing to bring average patient waiting time below 30 minutes.`);
    }
    if (recommendations.length === 0) {
      recommendations.push(`Continue continuous monitoring of ${department} quality indicators.`);
    }

    return {
      department,
      overallRiskScore: compositeRiskScore,
      riskCategory,
      components: {
        mlPredictionScore: mlRisk.riskScore,
        pathwayConformance: metric.pathwayConformance,
        conformanceGapScore: roundNum(conformanceComponent / 0.25, 1),
        anomalyScore: roundNum(anomalyComponent / 0.15, 1),
        benchmarkGap: metric.benchmarkGap,
        nonCompliantStandardsCount: nonCompliantStandards.length,
      },
      telemetry: metric,
      anomalies: anomalyResult.detectedAnomalies,
      nonCompliantStandards,
      contributingFactors: factors,
      recommendedActions: recommendations,
      disclaimer: 'Accreditation Risk Score is an intelligent decision-support synthesis for administrative review.',
    };
  }

  async getOverallHospitalRisk() {
    const departments = ['ICU', 'Emergency', 'Cardiology', 'Surgery', 'General Medicine'];
    const deptRisks = await Promise.all(departments.map((d) => this.calculateDepartmentRisk(d)));

    const avgScore = roundNum(
      deptRisks.reduce((acc, curr) => acc + curr.overallRiskScore, 0) / deptRisks.length,
      1
    );

    let riskCategory = 'LOW';
    if (avgScore > 80.0) riskCategory = 'CRITICAL';
    else if (avgScore > 60.0) riskCategory = 'HIGH';
    else if (avgScore > 30.0) riskCategory = 'MODERATE';

    // Department rankings
    const sortedDepts = [...deptRisks].sort((a, b) => b.overallRiskScore - a.overallRiskScore);

    // Highest risk department
    const topRiskDept = sortedDepts[0];

    return {
      hospitalName: 'Apollo Metro Memorial Hospital',
      accreditationFrameworks: ['NABH', 'JCI', 'The Joint Commission'],
      overallRiskScore: avgScore,
      riskCategory,
      topRiskDepartment: topRiskDept ? topRiskDept.department : 'ICU',
      departmentRisks: sortedDepts,
      summary: `Overall Hospital Accreditation Risk is ${riskCategory} (${avgScore}/100), led by ${topRiskDept ? topRiskDept.department : 'ICU'} (${topRiskDept ? topRiskDept.overallRiskScore : 82}/100).`,
    };
  }
}

function roundNum(num, dec = 1) {
  return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}

module.exports = new RiskService();
