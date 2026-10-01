const mongoose = require('mongoose');

const riskScoreSchema = new mongoose.Schema(
  {
    department: { type: String, required: true },
    overallRiskScore: { type: Number, required: true },
    riskCategory: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      required: true,
    },
    conformanceScore: { type: Number, default: 0.0 },
    operationalMetricScore: { type: Number, default: 0.0 },
    mlPredictionScore: { type: Number, default: 0.0 },
    anomalyScore: { type: Number, default: 0.0 },
    benchmarkGapScore: { type: Number, default: 0.0 },
    contributingFactors: [
      {
        feature: { type: String },
        value: { type: String },
        impact: { type: String },
        weightScore: { type: Number },
        explanation: { type: String },
      },
    ],
    recommendedActions: [{ type: String }],
    calculatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RiskScore', riskScoreSchema);
