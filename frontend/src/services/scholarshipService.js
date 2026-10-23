import apiClient from './apiClient.js';

export const scholarshipService = {
  async getScholarships(organizationId) {
    const res = await apiClient.get(`/api/organizations/${encodeURIComponent(organizationId)}/scholarships`);
    return res.data || [];
  },

  async getScholarshipById(organizationId, scholarshipId) {
    const res = await apiClient.get(`/api/organizations/${encodeURIComponent(organizationId)}/scholarships/${encodeURIComponent(scholarshipId)}`);
    return res.data;
  },

  async createScholarship(organizationId, { scholarshipName, scholarshipType, maximumAmount }) {
    const res = await apiClient.post(`/api/organizations/${encodeURIComponent(organizationId)}/scholarships`, {
      scholarshipName,
      scholarshipType: scholarshipType || null,
      maximumAmount: Number(maximumAmount),
    });
    return res.data;
  },

  async updateScholarship(organizationId, scholarshipId, { scholarshipName, scholarshipType, maximumAmount }) {
    const res = await apiClient.put(`/api/organizations/${encodeURIComponent(organizationId)}/scholarships/${encodeURIComponent(scholarshipId)}`, {
      scholarshipName,
      scholarshipType: scholarshipType || null,
      maximumAmount: Number(maximumAmount),
    });
    return res.data;
  },

  async deleteScholarship(organizationId, scholarshipId) {
    const res = await apiClient.del(`/api/organizations/${encodeURIComponent(organizationId)}/scholarships/${encodeURIComponent(scholarshipId)}`);
    return res;
  },

  async getStudentScholarships(organizationId, studentId) {
    const res = await apiClient.get(`/api/organizations/${encodeURIComponent(organizationId)}/students/${encodeURIComponent(studentId)}/scholarships`);
    return res.data || [];
  },

  async getStudentAwardSummary(organizationId, studentId) {
    const res = await apiClient.get(`/api/organizations/${encodeURIComponent(organizationId)}/students/${encodeURIComponent(studentId)}/scholarship-summary`);
    return res.data;
  },
};

export default scholarshipService;
