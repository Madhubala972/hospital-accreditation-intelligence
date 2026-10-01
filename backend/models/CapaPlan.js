const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const capaPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    department: {
      type: String,
      required: true,
      enum: ['ICU', 'Emergency', 'Cardiology', 'Surgery', 'Pediatrics', 'General', 'Oncology', 'All'],
      default: 'ICU',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      default: 'HIGH',
    },
    stage: {
      type: String,
      enum: ['BACKLOG', 'IN_PROGRESS', 'UNDER_REVIEW', 'RESOLVED'],
      default: 'BACKLOG',
    },
    standardCode: {
      type: String,
      default: 'NABH-COP-01',
    },
    standardBody: {
      type: String,
      enum: ['NABH', 'JCI', 'TJC', 'CDC', 'CMS', 'GENERAL'],
      default: 'NABH',
    },
    assignee: {
      name: { type: String, default: 'Dr. Sarah Jenkins' },
      role: { type: String, default: 'Accreditation Officer' },
      avatar: { type: String, default: 'SJ' },
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    estimatedRiskReduction: {
      type: Number,
      default: 12.5,
    },
    checklists: [checklistItemSchema],
    tags: [{ type: String }],
    order: { type: Number, default: 0 },
    sourceAlertId: { type: String },
    resolutionNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CapaPlan', capaPlanSchema);
