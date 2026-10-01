const express = require('express');
const router = express.Router();
const {
  getBenchmarks,
  getRadar,
  getDepartmentBenchmark,
  saveBenchmark,
} = require('../controllers/benchmarkController');

router.get('/', getBenchmarks);
router.post('/', saveBenchmark);
router.get('/radar', getRadar);
router.get('/:department', getDepartmentBenchmark);

module.exports = router;
