import api from './api';

export const aiApi = {
  chat: (query, department = 'ICU', chatHistory = [], simulationParams = null) =>
    api.post('/ai/chat', { query, department, chatHistory, simulationParams }),

  explainRisk: (department = 'ICU') =>
    api.post('/ai/explain-risk', { department }),

  simulateAndExplain: (params) =>
    api.post('/ai/simulation', params),

  getSuggestedPrompts: () =>
    api.get('/ai/suggested-prompts'),
};

export default aiApi;
