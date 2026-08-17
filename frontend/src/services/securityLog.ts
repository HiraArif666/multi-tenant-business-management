import api from './api';

export const getSecurityLogs = async (params?: any) => {
  const response = await api.get('/api/security-logs', {
    params,
  });

  return response.data;
};
