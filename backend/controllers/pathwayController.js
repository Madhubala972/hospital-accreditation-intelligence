const fs = require('fs');
const path = require('path');
const PatientPathway = require('../models/PatientPathway');
const externalDataService = require('../services/externalDataService');
const { getMongoStatus } = require('../config/db');
const logger = require('../utils/logger');

const fallbackPathwaysPath = path.join(__dirname, '../../database/sample_pathways.json');

const getFallbackPathways = () => {
  try {
    if (fs.existsSync(fallbackPathwaysPath)) {
      return JSON.parse(fs.readFileSync(fallbackPathwaysPath, 'utf8'));
    }
  } catch (e) {
    logger.error('Error reading fallback pathways:', e.message);
  }
  return [];
};

const saveFallbackPathways = (data) => {
  try {
    fs.writeFileSync(fallbackPathwaysPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    logger.error('Error saving fallback pathways:', e.message);
  }
};

// @route GET /api/pathways
const getAllPathways = async (req, res) => {
  try {
    let pathways = [];
    if (getMongoStatus()) {
      try {
        pathways = await PatientPathway.find().lean();
      } catch (e) {}
    }
    if (!pathways || pathways.length === 0) {
      pathways = getFallbackPathways();
    }
    res.json({ success: true, count: pathways.length, pathways });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/pathways/:department
const getDepartmentPathway = async (req, res) => {
  try {
    const { department } = req.params;
    let pathway = null;
    if (getMongoStatus()) {
      try {
        pathway = await PatientPathway.findOne({ department: new RegExp(`^${department}$`, 'i') }).lean();
      } catch (e) {}
    }
    if (!pathway) {
      const all = getFallbackPathways();
      pathway = all.find((p) => p.department.toLowerCase() === department.toLowerCase()) || all[0];
    }
    res.json({ success: true, pathway });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/pathways/traces
const addPatientTrace = async (req, res) => {
  try {
    const {
      department = 'ICU',
      caseId = `P-${Date.now().toString().slice(-4)}`,
      events = [],
      activities = [],
      notes = '',
    } = req.body;

    const eventList = (events && events.length > 0) ? events : activities;

    if (!eventList || eventList.length === 0) {
      return res.status(400).json({ success: false, message: 'Events or activities list cannot be empty' });
    }

    const all = getFallbackPathways();
    let pathway = all.find((p) => p.department.toLowerCase() === department.toLowerCase()) || all[0];

    // Determine conformance against expected steps
    const expected = pathway?.expectedSteps || [];
    const actualSteps = eventList.map((e) => (typeof e === 'string' ? e : e.activity));
    const missing = expected.filter((s) => !actualSteps.includes(s));
    const isConformant = missing.length === 0;

    const formattedEvents = eventList.map((e, idx) => {
      if (typeof e === 'string') {
        return {
          activity: e,
          timestamp: new Date(Date.now() + idx * 15 * 60 * 1000).toISOString(),
          resource: 'Staff-Duty',
          duration: 15,
        };
      }
      return {
        activity: e.activity || 'Care Event',
        timestamp: e.timestamp || new Date(Date.now() + idx * 15 * 60 * 1000).toISOString(),
        resource: e.resource || 'Staff-Duty',
        duration: Number(e.duration || 15),
      };
    });

    const newTrace = {
      caseId,
      isConformant,
      deviationType: isConformant ? 'None' : `Missing: ${missing.join(', ')}`,
      events: formattedEvents,
      notes: notes || (isConformant ? 'Standard pathway followed.' : `Skipped activities: ${missing.join(', ')}`),
    };

    if (!pathway.sampleTraces) pathway.sampleTraces = [];
    pathway.sampleTraces.unshift(newTrace);
    pathway.activeTraces = (pathway.activeTraces || pathway.sampleTraces.length) + 1;
    if (!isConformant) {
      pathway.deviatingTraces = (pathway.deviatingTraces || 0) + 1;
    }

    // Save fallback JSON
    saveFallbackPathways(all);

    // Save to Mongo if connected
    if (getMongoStatus()) {
      try {
        await PatientPathway.findOneAndUpdate(
          { department: new RegExp(`^${department}$`, 'i') },
          {
            $push: { sampleTraces: { $each: [newTrace], $position: 0 } },
            $inc: { activeTraces: 1, deviatingTraces: isConformant ? 0 : 1 },
          },
          { upsert: true }
        );
      } catch (e) {
        logger.warn(`Mongo pathway trace update warning: ${e.message}`);
      }
    }

    // Re-run PM4Py process mining on the updated traces
    const miningResult = await externalDataService.processMine({
      department,
      traces: pathway.sampleTraces,
    });

    logger.info(`[Data Entry] Added patient trace ${caseId} in ${department}. New Conformance: ${miningResult.conformanceRate}%`);

    res.status(201).json({
      success: true,
      message: `Patient trace ${caseId} logged successfully into ${department} event log!`,
      trace: newTrace,
      pathway,
      miningResult,
    });
  } catch (err) {
    logger.error('Error adding patient trace:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/pathways/analyze-process
const analyzeProcessMining = async (req, res) => {
  try {
    const { department = 'ICU', traces } = req.body;
    const all = getFallbackPathways();
    const pathway = all.find((p) => p.department.toLowerCase() === department.toLowerCase()) || all[0];

    const inputTraces = traces && traces.length > 0 ? traces : (pathway?.sampleTraces || []);

    const result = await externalDataService.processMine({
      department,
      traces: inputTraces,
    });

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/pathways/conformance-check
const checkConformance = async (req, res) => {
  try {
    const { department = 'ICU' } = req.body;
    const all = getFallbackPathways();
    const pathway = all.find((p) => p.department.toLowerCase() === department.toLowerCase()) || all[0];

    const result = await externalDataService.checkConformance({
      department,
      pathwayName: pathway?.name || 'ICU Clinical Pathway',
      expectedSteps: pathway?.expectedSteps || [],
      actualTraces: pathway?.sampleTraces || [],
    });

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/pathways/counterfactual
const runCounterfactual = async (req, res) => {
  try {
    const { department = 'ICU', deviationType = 'Medication Verification Skipped', actualMetrics } = req.body;
    const result = await externalDataService.counterfactual({
      department,
      deviationType,
      actualMetrics,
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllPathways,
  getDepartmentPathway,
  addPatientTrace,
  analyzeProcessMining,
  checkConformance,
  runCounterfactual,
};
