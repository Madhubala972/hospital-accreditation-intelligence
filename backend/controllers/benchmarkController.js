const fs = require('fs');
const path = require('path');
const Benchmark = require('../models/Benchmark');
const benchmarkService = require('../services/benchmarkService');
const { getMongoStatus } = require('../config/db');
const logger = require('../utils/logger');

const fallbackPath = path.join(__dirname, '../../database/sample_benchmarks.json');

const getFallbackData = () => {
  try {
    if (fs.existsSync(fallbackPath)) {
      return JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    }
  } catch (e) {
    logger.error('Error reading fallback benchmarks:', e.message);
  }
  return [];
};

const saveFallbackData = (data) => {
  try {
    fs.writeFileSync(fallbackPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    logger.error('Error saving fallback benchmarks:', e.message);
  }
};

// @route GET /api/benchmarks
const getBenchmarks = async (req, res) => {
  try {
    const { department } = req.query;
    const data = await benchmarkService.getBenchmarks(department);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/benchmarks/radar
const getRadar = async (req, res) => {
  try {
    const data = await benchmarkService.getRadarComparison();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/benchmarks/:department
const getDepartmentBenchmark = async (req, res) => {
  try {
    const { department } = req.params;
    const data = await benchmarkService.getBenchmarks(department);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/benchmarks
const saveBenchmark = async (req, res) => {
  try {
    const {
      department = 'ICU',
      indicator,
      metric,
      yourHospital,
      hospitalValue,
      peerAverage,
      regionalPeer,
      regionalBenchmark,
      nationalBenchmark,
      top10Benchmark,
      unit = '%',
      source = 'User Custom Benchmark Entry',
    } = req.body;

    const indName = indicator || metric;

    if (!indName) {
      return res.status(400).json({ success: false, message: 'Indicator or metric name is required' });
    }

    const yourVal = Number(yourHospital !== undefined ? yourHospital : (hospitalValue !== undefined ? hospitalValue : 0));
    const peerVal = Number(peerAverage !== undefined ? peerAverage : (regionalPeer !== undefined ? regionalPeer : 0));
    const regVal = Number(regionalBenchmark !== undefined ? regionalBenchmark : (regionalPeer !== undefined ? regionalPeer : 0));
    const natVal = Number(nationalBenchmark !== undefined ? nationalBenchmark : 0);
    const gap = Math.round((yourVal - peerVal) * 10) / 10;

    let percentile = 50;
    if (peerVal > 0) {
      percentile = Math.max(5, Math.min(99, Math.round(50 + ((yourVal / peerVal) - 1.0) * 80)));
    }

    let riskContribution = 'Moderate';
    if (gap < -10) riskContribution = 'Critical';
    else if (gap < 0) riskContribution = 'High';
    else if (gap < 5) riskContribution = 'Moderate';
    else riskContribution = 'Low';

    const benchmarkItem = {
      department,
      indicator: indName,
      metric: indName,
      yourHospital: yourVal,
      hospitalValue: yourVal,
      peerAverage: peerVal,
      regionalPeer: peerVal,
      regionalBenchmark: regVal,
      nationalBenchmark: natVal,
      top10Benchmark: Number(top10Benchmark || natVal * 0.8),
      percentile,
      percentileRank: percentile,
      gap,
      gapPercentage: gap,
      trend: gap < 0 ? 'Decreasing' : 'Improving',
      unit,
      source,
      riskContribution,
    };

    if (getMongoStatus()) {
      try {
        await Benchmark.findOneAndUpdate(
          { indicator: indName, department },
          { $set: benchmarkItem },
          { upsert: true, new: true }
        );
      } catch (e) {
        logger.warn(`Mongo benchmark update error: ${e.message}`);
      }
    }

    const all = getFallbackData();
    const existingIdx = all.findIndex(
      (b) =>
        (b.indicator || b.metric || '').toLowerCase() === indName.toLowerCase() &&
        (b.department || '').toLowerCase() === department.toLowerCase()
    );
    if (existingIdx >= 0) {
      all[existingIdx] = { ...all[existingIdx], ...benchmarkItem };
    } else {
      all.push(benchmarkItem);
    }
    saveFallbackData(all);

    logger.info(`[Data Entry] Saved benchmark indicator "${indName}" for ${department}. Gap: ${gap}${unit}`);

    res.json({
      success: true,
      message: `Benchmark indicator "${indicator}" saved successfully!`,
      benchmark: benchmarkItem,
    });
  } catch (err) {
    logger.error('Error saving benchmark:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getBenchmarks,
  getRadar,
  getDepartmentBenchmark,
  saveBenchmark,
};
