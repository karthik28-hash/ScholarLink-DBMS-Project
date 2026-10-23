import apiClient from './apiClient.js';

export const organizationService = {
  async getAllOrganizations() {
    const res = await apiClient.get('/api/organizations');
    return res.data || [];
  },

  async getOrganizationById(organizationId) {
    const res = await apiClient.get(`/api/organizations/${encodeURIComponent(organizationId)}`);
    return res.data;
  },

  async createOrganization({ organizationId, organizationName, organizationType, apiBaseUrl }) {
    const res = await apiClient.post('/api/organizations', {
      organizationId,
      organizationName,
      organizationType: organizationType || null,
      apiBaseUrl: apiBaseUrl || null,
    });
    return res.data;
  },

  async updateOrganization(organizationId, { organizationName, organizationType, apiBaseUrl }) {
    const res = await apiClient.put(`/api/organizations/${encodeURIComponent(organizationId)}`, {
      organizationName,
      organizationType: organizationType || null,
      apiBaseUrl: apiBaseUrl || null,
    });
    return res.data;
  },

  async deleteOrganization(organizationId) {
    const res = await apiClient.del(`/api/organizations/${encodeURIComponent(organizationId)}`);
    return res;
  },
};

export default organizationService;
