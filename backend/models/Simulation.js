const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema(
  {
    scenarioName: { type: String, required: true },
    department: { type: String, required: true },
    parameters: {
      patientArrivalRatePerHour: { type: Number },
      patientVolumePerDay: { type: Number },
      nursesOnDuty: { type: Number },
      doctorsOnDuty: { type: Number },
      bedCapacity: { type: Number },
      targetOccupancy: { type: Number },
      simulationHours: { type: Number, default: 24 },
    },
    baselineMetrics: {
      occupancyRate: { type: Number },
      avgWaitingTimeMinutes: { type: Number },
      nurseWorkloadUtilization: { type: Number },
      doctorWorkloadUtilization: { type: Number },
      triageQueueLength: { type: Number },
      projectedRiskScore: { type: Number },
      riskCategory: { type: String },
    },
    simulatedMetrics: {
      occupancyRate: { type: Number },
      avgWaitingTimeMinutes: { type: Number },
      nurseWorkloadUtilization: { type: Number },
      doctorWorkloadUtilization: { type: Number },
      triageQueueLength: { type: Number },
      projectedRiskScore: { type: Number },
      riskCategory: { type: String },
      bottlenecks: [{ type: String }],
    },
    comparison: {
      waitingTimeDeltaMinutes: { type: Number },
      queueLengthDelta: { type: Number },
      nurseUtilizationDeltaPercent: { type: Number },
      riskScoreDelta: { type: Number },
    },
    accreditationImpact: { type: String },
    createdBy: { type: String, default: 'System / User' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Simulation', simulationSchema);
