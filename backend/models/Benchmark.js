const mongoose = require('mongoose');

const benchmarkSchema = new mongoose.Schema(
  {
    department: { type: String, required: true },
    indicator: { type: String, required: true },
    yourHospital: { type: Number, required: true },
    peerAverage: { type: Number, required: true },
    regionalBenchmark: { type: Number, required: true },
    nationalBenchmark: { type: Number, required: true },
    percentile: { type: Number, default: 50 },
    gap: { type: Number, default: 0.0 },
    trend: { type: String, default: 'Stable' },
    unit: { type: String, default: '%' },
    source: { type: String, default: 'National Healthcare Quality Registry' },
    riskContribution: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      default: 'Moderate',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Benchmark', benchmarkSchema);
