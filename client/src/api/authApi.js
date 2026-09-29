import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  logout: () => client.post('/auth/logout'),
  getMe: () => client.get('/auth/me'),
  updateProfile: (data) => client.put('/auth/profile', data),
  changePassword: (data) => client.put('/auth/change-password', data),
};

export default authApi;
