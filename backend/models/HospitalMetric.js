const mongoose = require('mongoose');

const hospitalMetricSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      enum: ['ICU', 'Emergency', 'Cardiology', 'Surgery', 'General Medicine', 'All'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    occupancyRate: { type: Number, required: true },
    bedCapacity: { type: Number, required: true },
    occupiedBeds: { type: Number, required: true },
    avgWaitingTime: { type: Number, required: true },
    infectionRate: { type: Number, required: true },
    staffingLevel: { type: Number, required: true },
    nurseToPatientRatio: { type: Number, default: 0.3 },
    doctorToPatientRatio: { type: Number, default: 0.15 },
    incidentCount: { type: Number, default: 0 },
    pathwayConformance: { type: Number, required: true },
    medicationErrorRate: { type: Number, default: 0.0 },
    readmissionRate30Day: { type: Number, default: 0.0 },
    mortalityRate: { type: Number, default: 0.0 },
    handHygieneCompliance: { type: Number, default: 90.0 },
    benchmarkGap: { type: Number, default: 0.0 },
    riskScore: { type: Number, default: 0.0 },
    riskCategory: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      default: 'MODERATE',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HospitalMetric', hospitalMetricSchema);
