import React, { useState, useEffect } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import CurrencyValue, { formatINR } from '../components/CurrencyValue.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/FeedbackStates.jsx';
import { ConfirmDialog } from '../components/OverlayComponents.jsx';
import financialProfileService from '../services/financialProfileService.js';

export default function FinancialProfilePage({ student, onShowToast }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    annualFamilyIncome: '',
    familySize: '4',
    otherEducationExpense: '10000',
  });
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const studentId = student?.student_id || 'STU1001';

  async function loadProfile() {
    try {
      setLoading(true);
      setError(null);
      const data = await financialProfileService.getFinancialProfile(studentId);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load financial profile:', err);
      setError(err.message || 'Unable to load financial profile.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [studentId]);

  function handleOpenCreate() {
    setIsEditing(false);
    setFormData({
      annualFamilyIncome: '180000',
      familySize: '4',
      otherEducationExpense: '10000',
    });
    setIsFormOpen(true);
  }

  function handleOpenEdit() {
    if (!profile) return;
    setIsEditing(true);
    setFormData({
      annualFamilyIncome: String(profile.annual_family_income || ''),
      familySize: String(profile.family_size || '4'),
      otherEducationExpense: String(profile.other_education_expense || '0'),
    });
    setIsFormOpen(true);
  }

  async function handleSubmitForm(e) {
    e.preventDefault();
    if (!formData.annualFamilyIncome || Number(formData.annualFamilyIncome) < 0) {
      onShowToast?.({ type: 'error', message: 'Valid annual family income is required.' });
      return;
    }

    try {
      setSaving(true);
      if (isEditing) {
        await financialProfileService.updateFinancialProfile(studentId, {
          annualFamilyIncome: Number(formData.annualFamilyIncome),
          familySize: Number(formData.familySize),
          otherEducationExpense: Number(formData.otherEducationExpense),
        });
        onShowToast?.({ type: 'success', message: 'Financial profile updated successfully.' });
      } else {
        await financialProfileService.createFinancialProfile(studentId, {
          annualFamilyIncome: Number(formData.annualFamilyIncome),
          familySize: Number(formData.familySize),
          otherEducationExpense: Number(formData.otherEducationExpense),
        });
        onShowToast?.({ type: 'success', message: 'Financial profile established successfully.' });
      }

      setIsFormOpen(false);
      await loadProfile();
    } catch (err) {
      console.error('Save financial profile error:', err);
      onShowToast?.({ type: 'error', message: err.message || 'Failed to save financial profile.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    try {
      setDeleting(true);
      await financialProfileService.deleteFinancialProfile(studentId);
      onShowToast?.({ type: 'success', message: 'Financial profile removed.' });
      setShowDeleteConfirm(false);
      await loadProfile();
    } catch (err) {
      console.error('Delete financial profile error:', err);
      onShowToast?.({ type: 'error', message: err.message || 'Failed to remove financial profile.' });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex-col gap-lg">
      <PageHeading
        contextBadge={`Student ID #${studentId}`}
        subBadge="Financial Profile Registry"
        titleRegular="Student"
        titleItalic="financial profile."
        description="Manage the student's declared family economic profile, household dependents, and non-tuition academic living expenses used for need verification."
        actions={
          profile ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="sl-btn sl-btn-secondary sl-btn-sm"
                onClick={handleOpenEdit}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                <span>Edit Financial Profile</span>
              </button>
              <button
                type="button"
                className="sl-btn sl-btn-destructive sl-btn-sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                <span>Delete Profile</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="sl-btn sl-btn-primary sl-btn-sm"
              onClick={handleOpenCreate}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              <span>Create Financial Profile</span>
            </button>
          )
        }
      />

      {loading && <LoadingState message="Retrieving student financial profile..." />}

      {error && !loading && (
        <ErrorState
          title="Error Loading Profile"
          message={error}
          onRetry={loadProfile}
        />
      )}

      {/* Explicit Missing Profile State */}
      {!loading && !error && !profile && (
        <EmptyState
          title="No Financial Profile Found"
          description={`Student ${student?.name || studentId} does not currently have a registered financial profile in the central database. A financial profile is required to calculate the funding gap.`}
          icon="account_balance"
          actionLabel="Establish Financial Profile Now"
          onAction={handleOpenCreate}
        />
      )}

      {/* Profile Details Cards */}
      {!loading && !error && profile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section className="sl-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--surface-pale-blue)',
                    color: 'var(--primary-action)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined">receipt</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Economic Profile Parameters
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Record ID: #{profile.profile_id} • Student: {student?.name || studentId}
                  </div>
                </div>
              </div>
              <span className="sl-mono-chip" style={{ color: 'var(--status-verified)' }}>
                Active Profile
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px',
              }}
            >
              <div className="sl-card-neutral">
                <span className="sl-label">Annual Family Income</span>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  <CurrencyValue value={profile.annual_family_income} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Gross household income before tax deductions
                </div>
              </div>

              <div className="sl-card-neutral">
                <span className="sl-label">Family Household Size</span>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {profile.family_size} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Members</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Number of verified family dependents
                </div>
              </div>

              <div className="sl-card-neutral">
                <span className="sl-label">Other Education Expenses</span>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  <CurrencyValue value={profile.other_education_expense} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Annual academic overhead, books & living amenities
                </div>
              </div>
            </div>
          </section>

          <section className="sl-card-neutral" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary-action)', fontSize: '24px' }}>
              privacy_tip
            </span>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>Privacy and Minimization:</strong> Financial profile values are retained strictly within the central academic registry. During federated lookups with external foundations, only verified need clearances and grant awards are synchronized.
            </div>
          </section>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="sl-modal-overlay" onClick={() => !saving && setIsFormOpen(false)}>
          <div className="sl-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isEditing ? `Edit Financial Profile — ${studentId}` : `Create Financial Profile — ${studentId}`}
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
                <label className="sl-label" htmlFor="annual-income-field">
                  Annual Family Income (INR)
                </label>
                <input
                  id="annual-income-field"
                  className="sl-input font-mono"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.annualFamilyIncome}
                  onChange={(e) => setFormData({ ...formData, annualFamilyIncome: e.target.value })}
                  disabled={saving}
                  placeholder="e.g. 180000"
                  required
                />
              </div>

              <div className="sl-input-group">
                <label className="sl-label" htmlFor="family-size-field">
                  Family Size (Dependents)
                </label>
                <input
                  id="family-size-field"
                  className="sl-input font-mono"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.familySize}
                  onChange={(e) => setFormData({ ...formData, familySize: e.target.value })}
                  disabled={saving}
                  required
                />
              </div>

              <div className="sl-input-group">
                <label className="sl-label" htmlFor="other-expenses-field">
                  Other Education Expenses (INR)
                </label>
                <input
                  id="other-expenses-field"
                  className="sl-input font-mono"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.otherEducationExpense}
                  onChange={(e) => setFormData({ ...formData, otherEducationExpense: e.target.value })}
                  disabled={saving}
                  placeholder="e.g. 10000"
                />
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
                  {saving ? 'Saving...' : isEditing ? 'Update Financial Profile' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Remove Financial Profile"
        message={`Are you sure you want to delete the financial profile for student ${student?.name || studentId}? The student will not be able to calculate funding gap estimates until a new profile is established.`}
        confirmLabel="Remove Profile"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
