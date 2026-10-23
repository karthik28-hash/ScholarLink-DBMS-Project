import React, { useState, useEffect } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/FeedbackStates.jsx';
import { ConfirmDialog } from '../components/OverlayComponents.jsx';
import studentService from '../services/studentService.js';

export default function StudentProfilePage({
  student,
  onSelectStudent,
  onRefreshStudents,
  onShowToast,
}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    courseId: 1,
    collegeId: 1,
  });
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Available courses and colleges in the central database
  const courses = [
    { id: 1, name: 'Computer Science and Engineering (B.E.)' },
    { id: 2, name: 'Electronics and Communication Engineering (B.E.)' },
    { id: 3, name: 'Information Science and Engineering (B.E.)' },
    { id: 4, name: 'Commerce (B.Com)' },
  ];

  const colleges = [
    { id: 1, name: 'ABC Engineering College (ABC University)' },
    { id: 2, name: 'Global Institute of Technology (Global University)' },
    { id: 3, name: 'City Engineering University (City University)' },
  ];

  async function loadStudents() {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError(err.message || 'Unable to retrieve student records.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleOpenCreate() {
    setIsEditing(false);
    setFormData({
      studentId: `STU${1000 + students.length + 1}`,
      name: '',
      courseId: 1,
      collegeId: 1,
    });
    setIsFormOpen(true);
  }

  function handleOpenEdit(st) {
    setIsEditing(true);
    setFormData({
      studentId: st.student_id,
      name: st.name,
      courseId: st.course_id,
      collegeId: st.college_id,
    });
    setIsFormOpen(true);
  }

  async function handleSubmitForm(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      onShowToast?.({ type: 'error', message: 'Student full name is required.' });
      return;
    }

    try {
      setSaving(true);
      if (isEditing) {
        await studentService.updateStudent(formData.studentId, {
          name: formData.name.trim(),
          courseId: formData.courseId,
          collegeId: formData.collegeId,
        });
        onShowToast?.({ type: 'success', message: `Student ${formData.name} updated successfully.` });
      } else {
        await studentService.createStudent({
          studentId: formData.studentId.trim(),
          name: formData.name.trim(),
          courseId: formData.courseId,
          collegeId: formData.collegeId,
        });
        onShowToast?.({ type: 'success', message: `Student ${formData.name} created successfully.` });
      }

      setIsFormOpen(false);
      await loadStudents();
      onRefreshStudents?.();
    } catch (err) {
      console.error('Save student error:', err);
      onShowToast?.({ type: 'error', message: err.message || 'Failed to save student record.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await studentService.deleteStudent(deleteTarget.student_id);
      onShowToast?.({ type: 'success', message: `Student ${deleteTarget.name} removed successfully.` });
      setDeleteTarget(null);
      await loadStudents();
      onRefreshStudents?.();
    } catch (err) {
      console.error('Delete student error:', err);
      onShowToast?.({ type: 'error', message: err.message || 'Failed to delete student.' });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex-col gap-lg">
      <PageHeading
        contextBadge="Central Registry Data"
        subBadge="Student Records"
        titleRegular="Institutional"
        titleItalic="student profiles."
        description="Inspect, register, update, and manage student demographic and institutional course enrollment records stored in the central database."
        actions={
          <button
            type="button"
            className="sl-btn sl-btn-primary sl-btn-sm"
            onClick={handleOpenCreate}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
            <span>Register New Student</span>
          </button>
        }
      />

      {loading && <LoadingState message="Loading registered students..." />}

      {error && !loading && (
        <ErrorState
          title="Failed to Load Student Records"
          message={error}
          onRetry={loadStudents}
        />
      )}

      {!loading && !error && students.length === 0 && (
        <EmptyState
          title="No Students Registered"
          description="The student registry is currently empty."
          icon="group"
          actionLabel="Register First Student"
          onAction={handleOpenCreate}
        />
      )}

      {!loading && !error && students.length > 0 && (
        <div className="sl-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Registered Student Directory ({students.length})
            </h3>
            <span className="sl-mono-chip">Central Database Node</span>
          </div>

          <div className="sl-table-container">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Enrolled Course</th>
                  <th>College Institution</th>
                  <th>University</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => {
                  const isCurrent = student?.student_id === st.student_id;
                  return (
                    <tr
                      key={st.student_id}
                      style={{
                        backgroundColor: isCurrent ? 'var(--surface-pale-blue)' : undefined,
                      }}
                    >
                      <td>
                        <span className="sl-mono-chip" style={{ fontWeight: 600 }}>
                          {st.student_id}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{st.name}</span>
                          {isCurrent && (
                            <span className="sl-mono-chip" style={{ color: 'var(--primary-action)', fontSize: '10px' }}>
                              Active Context
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{st.course_name}</td>
                      <td>{st.college_name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{st.university_name}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            className="sl-btn sl-btn-secondary sl-btn-sm"
                            onClick={() => onSelectStudent?.(st)}
                            title="Make active student"
                          >
                            <span>Select</span>
                          </button>
                          <button
                            type="button"
                            className="sl-btn sl-btn-secondary sl-btn-sm"
                            onClick={() => handleOpenEdit(st)}
                            title="Edit student"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                          </button>
                          <button
                            type="button"
                            className="sl-btn sl-btn-destructive sl-btn-sm"
                            onClick={() => setDeleteTarget(st)}
                            title="Delete student"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      {isFormOpen && (
        <div className="sl-modal-overlay" onClick={() => !saving && setIsFormOpen(false)}>
          <div className="sl-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isEditing ? `Edit Student — ${formData.studentId}` : 'Register New Student'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="sl-input-group">
                <label className="sl-label" htmlFor="student-id-field">Student Identifier</label>
                <input
                  id="student-id-field"
                  className="sl-input"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  disabled={isEditing || saving}
                  placeholder="e.g. STU1006"
                  required
                />
              </div>

              <div className="sl-input-group">
                <label className="sl-label" htmlFor="student-name-field">Full Legal Name</label>
                <input
                  id="student-name-field"
                  className="sl-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={saving}
                  placeholder="e.g. Priyanshu Varma"
                  required
                />
              </div>

              <div className="sl-input-group">
                <label className="sl-label" htmlFor="student-course-field">Academic Course</label>
                <select
                  id="student-course-field"
                  className="sl-select"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: Number(e.target.value) })}
                  disabled={saving}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="sl-input-group">
                <label className="sl-label" htmlFor="student-college-field">Affiliated College Institution</label>
                <select
                  id="student-college-field"
                  className="sl-select"
                  value={formData.collegeId}
                  onChange={(e) => setFormData({ ...formData, collegeId: Number(e.target.value) })}
                  disabled={saving}
                >
                  {colleges.map((col) => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="sl-btn sl-btn-secondary"
                  onClick={() => setIsFormOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sl-btn sl-btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : isEditing ? 'Update Student Record' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Confirm Student Deletion"
        message={`Are you sure you want to permanently delete student ${deleteTarget?.name} (${deleteTarget?.student_id})? This will also cascade or remove related financial and query logs.`}
        confirmLabel="Delete Student"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
