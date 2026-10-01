import api from './api';

export const analyticsApi = {
  // Metrics
  getAllMetrics: () => api.get('/metrics'),
  getDepartmentMetric: (department) => api.get(`/metrics/${department}`),
  saveDepartmentMetric: (data) => api.post('/metrics', data),
  getKPIs: () => api.get('/metrics/summary/kpis'),
  getHistoricalTrends: () => api.get('/metrics/trends/historical'),

  // Pathways & Process Mining
  getAllPathways: () => api.get('/pathways'),
  getDepartmentPathway: (department) => api.get(`/pathways/${department}`),
  addPatientTrace: (data) => api.post('/pathways/traces', data),
  analyzeProcessMining: (data) => api.post('/pathways/analyze', data),
  checkConformance: (data) => api.post('/pathways/conformance-check', data),
  runCounterfactual: (data) => api.post('/pathways/counterfactual', data),

  // Risk
  getOverallRisk: () => api.get('/risk/overall'),
  getDepartmentRisk: (department) => api.get(`/risk/department/${department}`),
  getAccreditationStandards: (params) => api.get('/risk/standards', { params }),
  saveStandard: (data) => api.post('/risk/standards', data),

  // Digital Twin Simulation
  runSimulation: (data) => api.post('/simulation/run', data),
  getSavedScenarios: () => api.get('/simulation/scenarios'),

  // Alerts
  getAlerts: () => api.get('/alerts'),
  createAlert: (data) => api.post('/alerts', data),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
  updateAlertStatus: (id, status) => api.patch(`/alerts/${id}/status`, { status }),

  // Reports
  getExecutiveReport: () => api.get('/reports/executive-summary'),
};

export default analyticsApi;
