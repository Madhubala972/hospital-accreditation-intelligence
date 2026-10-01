const mongoose = require('mongoose');

const accreditationStandardSchema = new mongoose.Schema(
  {
    standardId: { type: String, required: true, unique: true },
    framework: {
      type: String,
      enum: ['NABH', 'JCI', 'The Joint Commission', 'Other'],
      default: 'NABH',
    },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    indicator: { type: String, required: true },
    threshold: { type: Number, required: true },
    operator: { type: String, enum: ['>=', '<=', '==', '>', '<'], default: '>=' },
    unit: { type: String, default: '%' },
    currentValue: { type: Number, default: 0.0 },
    department: { type: String, default: 'All' },
    weight: { type: Number, default: 0.1 },
    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      default: 'Moderate',
    },
    complianceStatus: {
      type: String,
      enum: ['Compliant', 'Sub-Optimal', 'Non-Compliant', 'At-Risk'],
      default: 'Compliant',
    },
    correctiveAction: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AccreditationStandard', accreditationStandardSchema);
