import client from './client';

export const jobsApi = {
  getJobs: (params) => client.get('/jobs', { params }),
  getJobById: (id) => client.get(`/jobs/${id}`),
  createJob: (data) => client.post('/jobs', data),
  updateJob: (id, data) => client.put(`/jobs/${id}`, data),
  deleteJob: (id) => client.delete(`/jobs/${id}`),
  getMyJobs: (params) => client.get('/jobs/my-jobs', { params }),
  toggleJobStatus: (id) => client.patch(`/jobs/${id}/toggle`),
};

export default jobsApi;
