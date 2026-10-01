const express = require('express');
const router = express.Router();
const {
  getAllPathways,
  getDepartmentPathway,
  addPatientTrace,
  analyzeProcessMining,
  checkConformance,
  runCounterfactual,
} = require('../controllers/pathwayController');

router.get('/', getAllPathways);
router.post('/traces', addPatientTrace);
router.post('/analyze', analyzeProcessMining);
router.post('/conformance-check', checkConformance);
router.post('/counterfactual', runCounterfactual);
router.get('/:department', getDepartmentPathway);

module.exports = router;
