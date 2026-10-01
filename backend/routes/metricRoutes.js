const express = require('express');
const router = express.Router();
const {
  getAllMetrics,
  getDepartmentMetric,
  saveDepartmentMetric,
  getKPIs,
  getHistoricalTrends,
} = require('../controllers/metricController');

router.get('/', getAllMetrics);
router.post('/', saveDepartmentMetric);
router.put('/:department', saveDepartmentMetric);
router.get('/summary/kpis', getKPIs);
router.get('/trends/historical', getHistoricalTrends);
router.get('/:department', getDepartmentMetric);

module.exports = router;
