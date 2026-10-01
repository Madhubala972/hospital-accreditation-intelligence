const express = require('express');
const router = express.Router();
const {
  getOverallRisk,
  getDepartmentRisk,
  getAccreditationStandards,
  saveAccreditationStandard,
} = require('../controllers/riskController');

router.get('/overall', getOverallRisk);
router.get('/standards', getAccreditationStandards);
router.post('/standards', saveAccreditationStandard);
router.get('/department/:department', getDepartmentRisk);

module.exports = router;
