const fs = require('fs');
const path = require('path');
const Benchmark = require('../models/Benchmark');
const { getMongoStatus } = require('../config/db');
const logger = require('../utils/logger');

class BenchmarkService {
  constructor() {
    this.fallbackPath = path.join(__dirname, '../../database/sample_benchmarks.json');
  }

  getFallbackData() {
    try {
      if (fs.existsSync(this.fallbackPath)) {
        return JSON.parse(fs.readFileSync(this.fallbackPath, 'utf8'));
      }
    } catch (e) {
      logger.error('Error reading fallback benchmarks:', e.message);
    }
    return [];
  }

  async getBenchmarks(department = null) {
    let benchmarks = [];

    if (getMongoStatus()) {
      try {
        const query = department && department !== 'All' ? { department } : {};
        benchmarks = await Benchmark.find(query).lean();
      } catch (err) {
        logger.warn(`Error querying MongoDB benchmarks: ${err.message}`);
      }
    }

    if (!benchmarks || benchmarks.length === 0) {
      const all = this.getFallbackData();
      benchmarks = department && department !== 'All'
        ? all.filter((b) => b.department.toLowerCase() === department.toLowerCase())
        : all;
    }

    // Compute aggregate summaries
    const totalGaps = benchmarks.map((b) => b.gap || 0);
    const avgGap = totalGaps.length ? roundNum(totalGaps.reduce((a, b) => a + b, 0) / totalGaps.length, 1) : 0;
    const criticalGapsCount = benchmarks.filter((b) => b.riskContribution === 'Critical' || b.riskContribution === 'High').length;

    return {
      department: department || 'All',
      totalIndicators: benchmarks.length,
      averageGap: avgGap,
      criticalGapsCount,
      source: 'National Healthcare Quality Registries (CMS / CDC NHSN / NABH)',
      benchmarks,
    };
  }

  async getRadarComparison() {
    const data = await this.getBenchmarks('All');
    const items = data.benchmarks || [];

    // Format for radar chart
    const radarData = items.slice(0, 6).map((item) => ({
      subject: item.indicator.replace(' Rate', '').replace(' Conformance', '').slice(0, 18),
      yourHospital: item.yourHospital,
      peerAverage: item.peerAverage,
      regionalBenchmark: item.regionalBenchmark,
      nationalBenchmark: item.nationalBenchmark,
      fullTitle: item.indicator,
      gap: item.gap,
      department: item.department,
    }));

    return {
      radarData,
      summary: data,
    };
  }
}

function roundNum(num, dec = 1) {
  return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}

module.exports = new BenchmarkService();
