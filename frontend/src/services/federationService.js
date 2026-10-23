import apiClient from './apiClient.js';

export const federationService = {
  async performFederatedLookup({ studentId, queryId }) {
    const res = await apiClient.post('/api/federation/lookup', {
      studentId,
      queryId,
    });
    return res.data;
  },

  async calculateFundingGap({ studentId, queryId, academicYear }) {
    const res = await apiClient.post('/api/federation/funding-gap', {
      studentId,
      queryId,
      academicYear,
    });
    return res.data;
  },

  async getDbHealth() {
    return await apiClient.get('/api/health/db');
  },
};

export default federationService;
