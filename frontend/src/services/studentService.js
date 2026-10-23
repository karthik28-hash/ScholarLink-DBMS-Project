import apiClient from './apiClient.js';

export const studentService = {
  async getAllStudents() {
    const res = await apiClient.get('/api/students');
    return res.data || [];
  },

  async getStudentById(studentId) {
    const res = await apiClient.get(`/api/students/${encodeURIComponent(studentId)}`);
    return res.data;
  },

  async createStudent({ studentId, name, courseId, collegeId }) {
    const res = await apiClient.post('/api/students', {
      studentId,
      name,
      courseId: Number(courseId),
      collegeId: Number(collegeId),
    });
    return res.data;
  },

  async updateStudent(studentId, { name, courseId, collegeId }) {
    const res = await apiClient.put(`/api/students/${encodeURIComponent(studentId)}`, {
      name,
      courseId: Number(courseId),
      collegeId: Number(collegeId),
    });
    return res.data;
  },

  async deleteStudent(studentId) {
    const res = await apiClient.del(`/api/students/${encodeURIComponent(studentId)}`);
    return res;
  },

  async getStudentOverview(studentId) {
    const res = await apiClient.get(`/api/students/${encodeURIComponent(studentId)}/overview`);
    return res.data;
  },
};

export default studentService;
