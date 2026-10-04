import client from './client';

export const skillsApi = {
  suggest: (q) => client.get('/skills', { params: { q, limit: 8 } }),
};

export default skillsApi;
