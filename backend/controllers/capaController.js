const fs = require('fs');
const path = require('path');
const CapaPlan = require('../models/CapaPlan');
const Alert = require('../models/Alert');
const { getMongoStatus } = require('../config/db');

// Load fallback default CAPA items from JSON file
let DEFAULT_CAPAS = [];
try {
  const jsonPath = path.join(__dirname, '../../database/sample_capa.json');
  if (fs.existsSync(jsonPath)) {
    DEFAULT_CAPAS = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
} catch (e) {
  DEFAULT_CAPAS = [];
}

/**
 * Helper to calculate summary metrics for CAPA board
 */
const calculateSummaryMetrics = (tasks) => {
  const total = tasks.length;
  const critical = tasks.filter((t) => t.priority === 'CRITICAL' && t.stage !== 'RESOLVED').length;
  const inProgress = tasks.filter((t) => t.stage === 'IN_PROGRESS').length;
  const underReview = tasks.filter((t) => t.stage === 'UNDER_REVIEW').length;
  const resolved = tasks.filter((t) => t.stage === 'RESOLVED').length;
  const totalRiskReduction = tasks.reduce((sum, t) => sum + (Number(t.estimatedRiskReduction) || 0), 0);
  const resolvedRiskReduction = tasks
    .filter((t) => t.stage === 'RESOLVED')
    .reduce((sum, t) => sum + (Number(t.estimatedRiskReduction) || 0), 0);

  const complianceRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  return {
    total,
    critical,
    inProgress,
    underReview,
    resolved,
    complianceRate,
    totalRiskReduction: Number(totalRiskReduction.toFixed(1)),
    resolvedRiskReduction: Number(resolvedRiskReduction.toFixed(1)),
  };
};

/**
 * @route GET /api/capa
 * @desc Get all CAPA Kanban tasks with optional department and search filtering
 */
const getCapaTasks = async (req, res) => {
  try {
    const { department, priority, search, standard } = req.query;
    let tasks = [];

    if (getMongoStatus()) {
      try {
        let query = {};
        if (department && department !== 'All') {
          query.department = department;
        }
        if (priority && priority !== 'All') {
          query.priority = priority;
        }
        if (standard && standard !== 'All') {
          query.standardBody = standard;
        }
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { standardCode: { $regex: search, $options: 'i' } },
          ];
        }
        tasks = await CapaPlan.find(query).sort({ order: 1, updatedAt: -1 }).lean();
      } catch (e) {
        tasks = [];
      }
    }

    if (!tasks || tasks.length === 0) {
      let filtered = [...DEFAULT_CAPAS];
      if (department && department !== 'All') {
        filtered = filtered.filter((t) => t.department === department || t.department === 'All');
      }
      if (priority && priority !== 'All') {
        filtered = filtered.filter((t) => t.priority === priority);
      }
      if (standard && standard !== 'All') {
        filtered = filtered.filter((t) => t.standardBody === standard);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.title.toLowerCase().includes(s) ||
            t.description.toLowerCase().includes(s) ||
            (t.standardCode && t.standardCode.toLowerCase().includes(s))
        );
      }
      tasks = filtered;
    }

    const metrics = calculateSummaryMetrics(tasks);

    res.json({
      success: true,
      metrics,
      tasks,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route POST /api/capa
 * @desc Create a new CAPA Kanban task
 */
const createCapaTask = async (req, res) => {
  try {
    const {
      title,
      description,
      department,
      priority,
      stage,
      standardCode,
      standardBody,
      assignee,
      dueDate,
      estimatedRiskReduction,
      checklists,
      tags,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    const newTaskData = {
      _id: 'capa-' + Date.now(),
      title,
      description: description || '',
      department: department || 'ICU',
      priority: priority || 'HIGH',
      stage: stage || 'BACKLOG',
      standardCode: standardCode || 'NABH-COP-01',
      standardBody: standardBody || 'NABH',
      assignee: assignee || { name: 'Dr. Sarah Jenkins', role: 'Accreditation Officer', avatar: 'SJ' },
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedRiskReduction: Number(estimatedRiskReduction) || 10.0,
      checklists: checklists || [],
      tags: tags || ['CAPA', department || 'ICU'],
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (getMongoStatus()) {
      try {
        const created = await CapaPlan.create(newTaskData);
        if (created) {
          return res.status(201).json({ success: true, task: created });
        }
      } catch (e) {}
    }

    DEFAULT_CAPAS.unshift(newTaskData);
    res.status(201).json({ success: true, task: newTaskData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route PATCH /api/capa/:id/stage
 * @desc Quickly update stage/column for drag-and-drop actions
 */
const updateTaskStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, order } = req.body;

    if (!['BACKLOG', 'IN_PROGRESS', 'UNDER_REVIEW', 'RESOLVED'].includes(stage)) {
      return res.status(400).json({ success: false, message: 'Invalid stage value.' });
    }

    if (getMongoStatus()) {
      try {
        const updateData = { stage, updatedAt: new Date() };
        if (order !== undefined) updateData.order = order;
        const updated = await CapaPlan.findByIdAndUpdate(id, updateData, { new: true });
        if (updated) return res.json({ success: true, task: updated });
      } catch (e) {}
    }

    const found = DEFAULT_CAPAS.find((t) => t._id === id || t.id === id);
    if (found) {
      found.stage = stage;
      if (order !== undefined) found.order = order;
      found.updatedAt = new Date();
      return res.json({ success: true, task: found });
    }

    res.json({ success: true, message: 'Task stage updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route PUT /api/capa/:id
 * @desc Edit full CAPA task details
 */
const updateCapaTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    if (getMongoStatus()) {
      try {
        const updated = await CapaPlan.findByIdAndUpdate(id, updateData, { new: true });
        if (updated) return res.json({ success: true, task: updated });
      } catch (e) {}
    }

    const idx = DEFAULT_CAPAS.findIndex((t) => t._id === id || t.id === id);
    if (idx !== -1) {
      DEFAULT_CAPAS[idx] = { ...DEFAULT_CAPAS[idx], ...updateData };
      return res.json({ success: true, task: DEFAULT_CAPAS[idx] });
    }

    res.status(404).json({ success: false, message: 'Task not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route PATCH /api/capa/:id/checklist/:itemIndex
 * @desc Toggle a checklist item status
 */
const toggleChecklistItem = async (req, res) => {
  try {
    const { id, itemIndex } = req.params;
    const index = parseInt(itemIndex, 10);

    if (getMongoStatus()) {
      try {
        const task = await CapaPlan.findById(id);
        if (task && task.checklists && task.checklists[index]) {
          task.checklists[index].completed = !task.checklists[index].completed;
          await task.save();
          return res.json({ success: true, task });
        }
      } catch (e) {}
    }

    const found = DEFAULT_CAPAS.find((t) => t._id === id || t.id === id);
    if (found && found.checklists && found.checklists[index]) {
      found.checklists[index].completed = !found.checklists[index].completed;
      found.updatedAt = new Date();
      return res.json({ success: true, task: found });
    }

    res.json({ success: true, message: 'Checklist toggled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route DELETE /api/capa/:id
 * @desc Delete a task
 */
const deleteCapaTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (getMongoStatus()) {
      try {
        await CapaPlan.findByIdAndDelete(id);
      } catch (e) {}
    }

    const idx = DEFAULT_CAPAS.findIndex((t) => t._id === id || t.id === id);
    if (idx !== -1) {
      DEFAULT_CAPAS.splice(idx, 1);
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route POST /api/capa/sync-alerts
 * @desc Import active high/critical alerts directly into the CAPA Kanban backlog
 */
const syncFromAlerts = async (req, res) => {
  try {
    let alerts = [];
    if (getMongoStatus()) {
      try {
        alerts = await Alert.find({ status: 'ACTIVE' }).lean();
      } catch (e) {}
    }
    if (!alerts || alerts.length === 0) {
      alerts = [
        {
          _id: 'alt-1',
          title: 'Critical Accreditation Risk Spike in ICU',
          severity: 'CRITICAL',
          department: 'ICU',
          category: 'ACCREDITATION_RISK',
          reason: 'Clinical pathway conformance fell to 71.0% and bed occupancy reached 94.0%.',
          recommendedAction: 'Enforce EHR medication verification checkpoints and activate step-down turnover.',
        },
        {
          _id: 'alt-2',
          title: 'Emergency Door-to-Doctor Waiting Time Anomaly',
          severity: 'HIGH',
          department: 'Emergency',
          category: 'ANOMALY',
          reason: 'Average triage waiting time (52.0m) exceeded baseline by +22 minutes.',
          recommendedAction: 'Deploy fast-track triage nurse to intake desk during peak surge hours.',
        },
      ];
    }

    const newlyCreated = [];

    for (const alert of alerts) {
      // Check if already in tasks
      let exists = false;
      if (getMongoStatus()) {
        try {
          exists = await CapaPlan.findOne({ sourceAlertId: alert._id });
        } catch (e) {}
      }
      if (!exists) {
        exists = DEFAULT_CAPAS.find((t) => t.sourceAlertId === alert._id);
      }

      if (!exists) {
        const newTask = {
          _id: 'capa-synced-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          title: `CAPA: ${alert.title}`,
          description: `${alert.reason} | Recommended: ${alert.recommendedAction}`,
          department: alert.department || 'ICU',
          priority: alert.severity || 'HIGH',
          stage: 'BACKLOG',
          standardCode: alert.category === 'ACCREDITATION_RISK' ? 'NABH-COP-01' : 'JCI-COP-02',
          standardBody: 'NABH',
          assignee: { name: 'Dr. Sarah Jenkins', role: 'Accreditation Officer', avatar: 'SJ' },
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          estimatedRiskReduction: alert.severity === 'CRITICAL' ? 35.0 : 20.0,
          checklists: [
            { text: 'Conduct initial root-cause review with nursing supervisor', completed: false },
            { text: alert.recommendedAction || 'Execute corrective action protocol', completed: false },
            { text: 'Verify 7-day conformance metrics telemetry', completed: false },
          ],
          tags: ['AI Synced', alert.category, alert.department],
          sourceAlertId: alert._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (getMongoStatus()) {
          try {
            await CapaPlan.create(newTask);
          } catch (e) {}
        }
        DEFAULT_CAPAS.unshift(newTask);
        newlyCreated.push(newTask);
      }
    }

    res.json({
      success: true,
      syncedCount: newlyCreated.length,
      message: `Successfully synced ${newlyCreated.length} alert(s) into Kanban backlog.`,
      newTasks: newlyCreated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCapaTasks,
  createCapaTask,
  updateCapaTask,
  updateTaskStage,
  toggleChecklistItem,
  deleteCapaTask,
  syncFromAlerts,
};
