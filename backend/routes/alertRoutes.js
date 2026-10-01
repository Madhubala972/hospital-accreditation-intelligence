const express = require('express');
const router = express.Router();
const { getAlerts, updateAlertStatus, createAlert, deleteAlert } = require('../controllers/alertController');

router.get('/', getAlerts);
router.post('/', createAlert);
router.patch('/:id/status', updateAlertStatus);
router.delete('/:id', deleteAlert);

module.exports = router;

