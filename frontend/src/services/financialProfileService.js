import apiClient from './apiClient.js';

export const financialProfileService = {
  async getFinancialProfile(studentId) {
    try {
      const res = await apiClient.get(`/api/students/${encodeURIComponent(studentId)}/financial-profile`);
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        return null;
      }
      throw err;
    }
  },

  async createFinancialProfile(studentId, { annualFamilyIncome, familySize, otherEducationExpense }) {
    const res = await apiClient.post(`/api/students/${encodeURIComponent(studentId)}/financial-profile`, {
      annualFamilyIncome: Number(annualFamilyIncome),
      familySize: Number(familySize),
      otherEducationExpense: Number(otherEducationExpense || 0),
    });
    return res.data;
  },

  async updateFinancialProfile(studentId, { annualFamilyIncome, familySize, otherEducationExpense }) {
    const res = await apiClient.put(`/api/students/${encodeURIComponent(studentId)}/financial-profile`, {
      annualFamilyIncome: Number(annualFamilyIncome),
      familySize: Number(familySize),
      otherEducationExpense: Number(otherEducationExpense || 0),
    });
    return res.data;
  },

  async deleteFinancialProfile(studentId) {
    const res = await apiClient.del(`/api/students/${encodeURIComponent(studentId)}/financial-profile`);
    return res;
  },
};

export default financialProfileService;
