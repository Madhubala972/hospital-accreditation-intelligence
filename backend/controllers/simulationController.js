const externalDataService = require('../services/externalDataService');
const Simulation = require('../models/Simulation');
const { getMongoStatus } = require('../config/db');
const fs = require('fs');
const path = require('path');

const fallbackSimPath = path.join(__dirname, '../../database/sample_simulations.json');

// @route POST /api/simulation/run
const runSimulation = async (req, res) => {
  try {
    const {
      scenarioName = 'What-If Operational Scenario',
      department = 'ICU',
      patientVolumePerDay = 500,
      nursesOnDuty = 15,
      doctorsOnDuty = 5,
      bedCapacity = 35,
      targetOccupancy = 90,
      simulationHours = 24,
      baselineOccupancy = 82,
      baselineNurses = 18,
      baselineDoctors = 6,
      baselineVolume = 400,
    } = req.body;

    const simPayload = {
      scenarioName,
      department,
      patientVolumePerDay: Number(patientVolumePerDay),
      nursesOnDuty: Number(nursesOnDuty),
      doctorsOnDuty: Number(doctorsOnDuty),
      bedCapacity: Number(bedCapacity),
      targetOccupancy: Number(targetOccupancy),
      simulationHours: Number(simulationHours),
      baselineOccupancy: Number(baselineOccupancy),
      baselineNurses: Number(baselineNurses),
      baselineDoctors: Number(baselineDoctors),
      baselineVolume: Number(baselineVolume),
    };

    const simResult = await externalDataService.simulate(simPayload);

    // Save simulation run if MongoDB is available
    if (getMongoStatus()) {
      try {
        await Simulation.create({
          scenarioName,
          department,
          parameters: simPayload,
          baselineMetrics: simResult.baseline,
          simulatedMetrics: simResult.simulated,
          comparison: simResult.comparison,
          accreditationImpact: simResult.accreditationImpact,
          createdBy: req.user ? req.user.name : 'System User',
        });
      } catch (e) {}
    }

    res.json({ success: true, result: simResult });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/simulation/saved-scenarios
const getSavedScenarios = async (req, res) => {
  try {
    let scenarios = [];
    if (getMongoStatus()) {
      try {
        scenarios = await Simulation.find().sort({ createdAt: -1 }).limit(10).lean();
      } catch (e) {}
    }
    if (!scenarios || scenarios.length === 0) {
      if (fs.existsSync(fallbackSimPath)) {
        scenarios = JSON.parse(fs.readFileSync(fallbackSimPath, 'utf8'));
      }
    }
    res.json({ success: true, scenarios });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  runSimulation,
  getSavedScenarios,
};
