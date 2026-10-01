const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    userId: { type: String, default: 'System' },
    userName: { type: String, default: 'System Automated Engine' },
    department: { type: String, default: 'All' },
    details: { type: Object },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
