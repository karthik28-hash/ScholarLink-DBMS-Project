import apiClient from './apiClient.js';

export const awardService = {
  async getAllAwards(organizationId) {
    const res = await apiClient.get(`/api/organizations/${encodeURIComponent(organizationId)}/awards`);
    return res.data || [];
  },

  async getAwardById(organizationId, awardId) {
    const res = await apiClient.get(`/api/organizations/${encodeURIComponent(organizationId)}/awards/${encodeURIComponent(awardId)}`);
    return res.data;
  },

  async createAward(organizationId, { applicationId, amount, awardDate, academicYear }) {
    const res = await apiClient.post(`/api/organizations/${encodeURIComponent(organizationId)}/awards`, {
      applicationId: Number(applicationId),
      amount: Number(amount),
      awardDate,
      academicYear,
    });
    return res.data;
  },

  async updateAward(organizationId, awardId, { amount, awardDate, academicYear }) {
    const res = await apiClient.put(`/api/organizations/${encodeURIComponent(organizationId)}/awards/${encodeURIComponent(awardId)}`, {
      amount: Number(amount),
      awardDate,
      academicYear,
    });
    return res.data;
  },

  async deleteAward(organizationId, awardId) {
    const res = await apiClient.del(`/api/organizations/${encodeURIComponent(organizationId)}/awards/${encodeURIComponent(awardId)}`);
    return res;
  },
};

export default awardService;
