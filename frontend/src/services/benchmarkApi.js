import api from './api';

export const benchmarkApi = {
  getBenchmarks: (department = 'All') => api.get(`/benchmarks?department=${department}`),
  getRadar: () => api.get('/benchmarks/radar'),
  getDepartmentBenchmark: (department) => api.get(`/benchmarks/${department}`),
  saveBenchmark: (data) => api.post('/benchmarks', data),
};

export default benchmarkApi;
