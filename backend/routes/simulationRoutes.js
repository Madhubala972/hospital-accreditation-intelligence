const express = require('express');
const router = express.Router();
const { runSimulation, getSavedScenarios } = require('../controllers/simulationController');

router.post('/run', runSimulation);
router.get('/scenarios', getSavedScenarios);

module.exports = router;
