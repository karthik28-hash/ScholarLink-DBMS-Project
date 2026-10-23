import apiClient from './apiClient.js';

export const applicationService = {
  async getAllApplications(organizationId) {
    const res = await apiClient.get(`/api/organizations/${encodeURIComponent(organizationId)}/applications`);
    return res.data || [];
  },

  async getApplicationById(organizationId, applicationId) {
    const res = await apiClient.get(`/api/organizations/${encodeURIComponent(organizationId)}/applications/${encodeURIComponent(applicationId)}`);
    return res.data;
  },

  async createApplication(organizationId, { studentId, scholarshipId, applicationDate, selfDeclaredPriorSupport, status }) {
    const res = await apiClient.post(`/api/organizations/${encodeURIComponent(organizationId)}/applications`, {
      studentId,
      scholarshipId: Number(scholarshipId),
      applicationDate,
      selfDeclaredPriorSupport: Boolean(selfDeclaredPriorSupport),
      status,
    });
    return res.data;
  },

  async updateApplication(organizationId, applicationId, { scholarshipId, applicationDate, selfDeclaredPriorSupport, status }) {
    const res = await apiClient.put(`/api/organizations/${encodeURIComponent(organizationId)}/applications/${encodeURIComponent(applicationId)}`, {
      scholarshipId: Number(scholarshipId),
      applicationDate,
      selfDeclaredPriorSupport: Boolean(selfDeclaredPriorSupport),
      status,
    });
    return res.data;
  },

  async deleteApplication(organizationId, applicationId) {
    const res = await apiClient.del(`/api/organizations/${encodeURIComponent(organizationId)}/applications/${encodeURIComponent(applicationId)}`);
    return res;
  },
};

export default applicationService;
