const express = require('express');
const router = express.Router();
const {
  getCapaTasks,
  createCapaTask,
  updateCapaTask,
  updateTaskStage,
  toggleChecklistItem,
  deleteCapaTask,
  syncFromAlerts,
} = require('../controllers/capaController');
const { protect } = require('../middleware/auth');

// Optional auth protection (routes will work even without auth header for flexible local testing)
router.get('/', getCapaTasks);
router.post('/', createCapaTask);
router.post('/sync-alerts', syncFromAlerts);
router.put('/:id', updateCapaTask);
router.patch('/:id/stage', updateTaskStage);
router.patch('/:id/checklist/:itemIndex', toggleChecklistItem);
router.delete('/:id', deleteCapaTask);

module.exports = router;
