const express = require('express');
const router = express.Router();
const { getExecutiveReport } = require('../controllers/reportController');

router.get('/', getExecutiveReport);
router.get('/executive-summary', getExecutiveReport);

module.exports = router;
