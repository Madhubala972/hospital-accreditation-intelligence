const llmService = require('../services/llmService');
const riskService = require('../services/riskService');
const AIConversation = require('../models/AIConversation');
const { getMongoStatus } = require('../config/db');

// @route POST /api/ai/chat
const chatWithCopilot = async (req, res) => {
  try {
    const { query, message, prompt, department = 'ICU', chatHistory = [], simulationParams } = req.body;
    const userPrompt = query || message || prompt;

    if (!userPrompt) {
      return res.status(400).json({ success: false, message: 'Query or message string is required' });
    }

    const aiResponse = await llmService.processQuery({
      query: userPrompt,
      department,
      chatHistory,
      simulationParams,
    });

    // Save message to conversation collection if MongoDB connected
    if (getMongoStatus() && req.user) {
      try {
        await AIConversation.create({
          userId: req.user.id || req.user._id,
          role: req.user.role,
          messages: [
            { sender: 'user', content: userPrompt, timestamp: new Date() },
            {
              sender: 'assistant',
              content: aiResponse.answer,
              timestamp: new Date(),
              contextInjected: aiResponse.contextInjected,
            },
          ],
        });
      } catch (e) {}
    }

    res.json({
      success: true,
      answer: aiResponse.answer,
      reply: aiResponse.answer,
      contextInjected: aiResponse.contextInjected,
      engine: aiResponse.engine,
      groundedDataSources: aiResponse.groundedDataSources,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/ai/explain-risk
const explainRisk = async (req, res) => {
  try {
    const { department = 'ICU' } = req.body;
    const query = `Why is ${department} accreditation risk high and what are the main contributing factors?`;
    const aiResponse = await llmService.processQuery({ query, department });
    res.json({ success: true, ...aiResponse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/ai/simulate-and-explain
const simulateAndExplain = async (req, res) => {
  try {
    const { department = 'ICU', targetOccupancy = 100, patientVolumePerDay = 650, nursesOnDuty = 12 } = req.body;
    const query = `What happens to waiting time and accreditation risk if ${department} occupancy reaches ${targetOccupancy}%?`;
    const aiResponse = await llmService.processQuery({
      query,
      department,
      simulationParams: {
        department,
        targetOccupancy,
        patientVolumePerDay,
        nursesOnDuty,
        doctorsOnDuty: 4,
        bedCapacity: 35,
      },
    });
    res.json({ success: true, ...aiResponse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/ai/suggested-prompts
const getSuggestedPrompts = (req, res) => {
  const prompts = [
    { title: 'Explain ICU Risk', prompt: 'What is causing the ICU accreditation risk and non-compliant indicators?' },
    { title: 'Simulate 100% Occupancy', prompt: 'What happens to triage queues and accreditation risk if ICU occupancy reaches 100%?' },
    { title: 'Top Management Priorities', prompt: 'What should management prioritize in the next 48 hours to prevent accreditation downgrades?' },
    { title: 'Peer Benchmark Gap', prompt: 'Compare our hospital performance with regional peer benchmarks.' },
    { title: 'Process Deviations', prompt: 'Which clinical pathway has the most skipped activities and sequence violations?' },
  ];
  res.json({ success: true, prompts });
};

module.exports = {
  chatWithCopilot,
  explainRisk,
  simulateAndExplain,
  getSuggestedPrompts,
};
