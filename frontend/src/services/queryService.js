import apiClient from './apiClient.js';

export const queryService = {
  async getAllQueries() {
    const res = await apiClient.get('/api/queries');
    return res.data || [];
  },

  async getQueryById(queryId) {
    const res = await apiClient.get(`/api/queries/${encodeURIComponent(queryId)}`);
    return res.data;
  },

  async getQueriesByStudent(studentId) {
    const res = await apiClient.get(`/api/queries/student/${encodeURIComponent(studentId)}`);
    return res.data || [];
  },

  async createQuery({ studentId, organizationIds, organizationId, purpose }) {
    const res = await apiClient.post('/api/queries', {
      studentId,
      organizationIds: organizationIds || (organizationId ? [organizationId] : []),
      organizationId,
      purpose,
    });
    return res.data;
  },

  async updateQueryStatus(queryId, status) {
    const res = await apiClient.patch(`/api/queries/${encodeURIComponent(queryId)}/status`, {
      status,
    });
    return res.data;
  },
};

export default queryService;
