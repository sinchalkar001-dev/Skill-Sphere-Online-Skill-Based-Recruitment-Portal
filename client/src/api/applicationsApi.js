import client from './client';

export const applicationsApi = {
  create: (data) => client.post('/applications', data),
  getMyApplications: (params) => client.get('/applications/my', { params }),
  getStats: () => client.get('/applications/stats'),
  getJobApplications: (jobId, params) => client.get(`/applications/job/${jobId}`, { params }),
  getById: (id) => client.get(`/applications/${id}`),
  updateStatus: (id, data) => client.patch(`/applications/${id}/status`, data),
  assess: (id, data) => client.patch(`/applications/${id}/assess`, data),
  getAssessment: (id) => client.get(`/applications/${id}/assessment`),
  withdraw: (id) => client.delete(`/applications/${id}`),
};

export default applicationsApi;
