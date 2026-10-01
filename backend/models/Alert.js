const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    severity: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      default: 'HIGH',
    },
    department: { type: String, required: true },
    category: {
      type: String,
      enum: ['ACCREDITATION_RISK', 'PROCESS_CONFORMANCE', 'ICU_SURGE', 'ANOMALY', 'BENCHMARK_GAP', 'MEDICATION_SAFETY'],
      default: 'ACCREDITATION_RISK',
    },
    reason: { type: String, required: true },
    recommendedAction: { type: String, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'ACTIVE',
    },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Alert', alertSchema);
