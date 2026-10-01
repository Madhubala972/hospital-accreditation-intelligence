const express = require('express');
const router = express.Router();
const {
  chatWithCopilot,
  explainRisk,
  simulateAndExplain,
  getSuggestedPrompts,
} = require('../controllers/aiController');

router.post('/chat', chatWithCopilot);
router.post('/explain-risk', explainRisk);
router.post('/simulation', simulateAndExplain);
router.get('/suggested-prompts', getSuggestedPrompts);

module.exports = router;
