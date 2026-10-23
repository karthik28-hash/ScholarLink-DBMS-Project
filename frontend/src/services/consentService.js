import apiClient from './apiClient.js';

export const consentService = {
  async requestConsent(queryId) {
    const res = await apiClient.post(`/api/consents/${encodeURIComponent(queryId)}/request`);
    return res.data;
  },

  async verifyConsent(queryId, otpCode) {
    const res = await apiClient.post(`/api/consents/${encodeURIComponent(queryId)}/verify`, {
      otpCode,
    });
    return res.data;
  },

  async denyConsent(queryId) {
    const res = await apiClient.post(`/api/consents/${encodeURIComponent(queryId)}/deny`);
    return res.data;
  },

  async getConsent(queryId) {
    try {
      const res = await apiClient.get(`/api/consents/${encodeURIComponent(queryId)}`);
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        return null;
      }
      throw err;
    }
  },
};

export default consentService;
