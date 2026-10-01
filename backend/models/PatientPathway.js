const mongoose = require('mongoose');

const patientPathwaySchema = new mongoose.Schema(
  {
    pathwayId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    description: { type: String },
    expectedSteps: [{ type: String }],
    benchmarkDurationMinutes: { type: Number, default: 120 },
    conformanceTarget: { type: Number, default: 90.0 },
    currentConformance: { type: Number, default: 80.0 },
    activeTraces: { type: Number, default: 0 },
    deviatingTraces: { type: Number, default: 0 },
    commonDeviations: [
      {
        type: { type: String },
        activity: { type: String },
        avgDelayMinutes: { type: Number },
        frequency: { type: Number },
        impact: { type: String },
      },
    ],
    sampleTraces: [
      {
        caseId: { type: String },
        isConformant: { type: Boolean },
        deviationType: { type: String },
        events: [
          {
            activity: { type: String },
            timestamp: { type: Date },
            resource: { type: String },
            duration: { type: Number },
          },
        ],
        notes: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PatientPathway', patientPathwaySchema);
