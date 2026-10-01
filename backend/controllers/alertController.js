const Alert = require('../models/Alert');
const { getMongoStatus } = require('../config/db');

const DEFAULT_ALERTS = [
  {
    _id: 'alt-1',
    title: 'Critical Accreditation Risk Spike in ICU',
    severity: 'CRITICAL',
    department: 'ICU',
    category: 'ACCREDITATION_RISK',
    reason: 'Clinical pathway conformance fell to 71.0% and bed occupancy reached 94.0% with elevated infection rates (3.8/1000).',
    recommendedAction: 'Enforce EHR medication verification checkpoints and activate step-down discharge bed turnover protocols.',
    status: 'ACTIVE',
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
  },
  {
    _id: 'alt-2',
    title: 'Emergency Door-to-Doctor Waiting Time Anomaly',
    severity: 'HIGH',
    department: 'Emergency',
    category: 'ANOMALY',
    reason: 'Average triage waiting time (52.0m) exceeded maximum permissible baseline by +22 minutes.',
    recommendedAction: 'Deploy fast-track triage nurse to intake desk during peak surge hours.',
    status: 'ACTIVE',
    timestamp: new Date(Date.now() - 120 * 60 * 1000),
  },
  {
    _id: 'alt-3',
    title: 'Medication Verification Omission in Sepsis Protocol',
    severity: 'HIGH',
    department: 'ICU',
    category: 'PROCESS_CONFORMANCE',
    reason: '28 patient pathways bypassed dual-nurse verification step prior to antibiotic infusion.',
    recommendedAction: 'Mandate digital barcode scanning before infusion pump initiation.',
    status: 'ACKNOWLEDGED',
    timestamp: new Date(Date.now() - 240 * 60 * 1000),
  },
  {
    _id: 'alt-4',
    title: 'Regional Peer Benchmark Conformance Gap (-13%)',
    severity: 'MODERATE',
    department: 'ICU',
    category: 'BENCHMARK_GAP',
    reason: 'ICU clinical pathway conformance ranks in the 24th percentile nationally.',
    recommendedAction: 'Review clinical audit logs and conduct staff re-training on sepsis protocol.',
    status: 'ACTIVE',
    timestamp: new Date(Date.now() - 480 * 60 * 1000),
  },
];

// @route GET /api/alerts
const getAlerts = async (req, res) => {
  try {
    let alerts = [];
    if (getMongoStatus()) {
      try {
        alerts = await Alert.find().sort({ timestamp: -1 }).lean();
      } catch (e) {}
    }
    if (!alerts || alerts.length === 0) {
      alerts = DEFAULT_ALERTS;
    }

    const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;
    const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;

    res.json({
      success: true,
      totalAlerts: alerts.length,
      activeCount,
      criticalCount,
      alerts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PATCH /api/alerts/:id/status
const updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (getMongoStatus()) {
      try {
        const updated = await Alert.findByIdAndUpdate(id, { status }, { new: true });
        if (updated) return res.json({ success: true, alert: updated });
      } catch (e) {}
    }

    // In-memory update
    const found = DEFAULT_ALERTS.find((a) => a._id === id || a.id === id);
    if (found) {
      found.status = status;
      return res.json({ success: true, alert: found });
    }

    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/alerts
const createAlert = async (req, res) => {
  try {
    const { title, severity, department, category, reason, recommendedAction } = req.body;
    if (!title || !department) {
      return res.status(400).json({ success: false, message: 'Title and department are required.' });
    }

    const newAlertData = {
      _id: 'alt-' + Date.now(),
      title,
      severity: severity || 'MODERATE',
      department,
      category: category || 'OPERATIONAL_DEFICIT',
      reason: reason || 'Manual audit observation or telemetry threshold exceeded.',
      recommendedAction: recommendedAction || 'Review departmental workflow and protocol compliance.',
      status: 'ACTIVE',
      timestamp: new Date(),
    };

    if (getMongoStatus()) {
      try {
        const created = await Alert.create(newAlertData);
        if (created) return res.status(201).json({ success: true, alert: created });
      } catch (e) {}
    }

    DEFAULT_ALERTS.unshift(newAlertData);
    res.status(201).json({ success: true, alert: newAlertData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/alerts/:id
const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    if (getMongoStatus()) {
      try {
        await Alert.findByIdAndDelete(id);
      } catch (e) {}
    }
    const idx = DEFAULT_ALERTS.findIndex((a) => a._id === id || a.id === id);
    if (idx !== -1) {
      DEFAULT_ALERTS.splice(idx, 1);
    }
    res.json({ success: true, message: 'Alert deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAlerts,
  updateAlertStatus,
  createAlert,
  deleteAlert,
};

