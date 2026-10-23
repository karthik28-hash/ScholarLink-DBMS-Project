import React, { useState, useEffect } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import CurrencyValue, { formatINR } from '../components/CurrencyValue.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/FeedbackStates.jsx';
import { ConfirmDialog } from '../components/OverlayComponents.jsx';
import organizationService from '../services/organizationService.js';
import scholarshipService from '../services/scholarshipService.js';

export default function ScholarshipDirectoryPage({ onShowToast }) {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('ORG001');
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    scholarshipName: '',
    scholarshipType: 'Need-based',
    maximumAmount: '50000',
  });
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData(orgId) {
    try {
      setLoading(true);
      setError(null);
      const orgs = await organizationService.getAllOrganizations();
      setOrganizations(orgs);

      const targetId = orgId || selectedOrgId || orgs[0]?.organization_id;
      if (targetId) {
        setSelectedOrgId(targetId);
        const sch = await scholarshipService.getScholarships(targetId);
        setScholarships(sch);
      }
    } catch (err) {
      console.error('Failed to load scholarships:', err);
      setError(err.message || 'Unable to retrieve scholarship directory.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSelectOrg(orgId) {
    setSelectedOrgId(orgId);
    try {
      setLoading(true);
      const sch = await scholarshipService.getScholarships(orgId);
      setScholarships(sch);
    } catch (err) {
      onShowToast?.({ type: 'error', message: err.message || 'Failed to load organization programs.' });
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      scholarshipName: '',
      scholarshipType: 'Need-based',
      maximumAmount: '50000',
    });
    setIsFormOpen(true);
  }

  function handleOpenEdit(sch) {
    setIsEditing(true);
    setEditingId(sch.scholarship_id);
    setFormData({
      scholarshipName: sch.scholarship_name,
      scholarshipType: sch.scholarship_type || 'Need-based',
      maximumAmount: String(sch.maximum_amount || '0'),
    });
    setIsFormOpen(true);
  }

  async function handleSubmitForm(e) {
    e.preventDefault();
    if (!formData.scholarshipName.trim()) {
      onShowToast?.({ type: 'error', message: 'Program name is required.' });
      return;
    }

    try {
      setSaving(true);
      if (isEditing) {
        await scholarshipService.updateScholarship(selectedOrgId, editingId, {
          scholarshipName: formData.scholarshipName.trim(),
          scholarshipType: formData.scholarshipType,
          maximumAmount: Number(formData.maximumAmount),
        });
        onShowToast?.({ type: 'success', message: 'Scholarship program updated successfully.' });
      } else {
        await scholarshipService.createScholarship(selectedOrgId, {
          scholarshipName: formData.scholarshipName.trim(),
          scholarshipType: formData.scholarshipType,
          maximumAmount: Number(formData.maximumAmount),
        });
        onShowToast?.({ type: 'success', message: 'New scholarship program cataloged.' });
      }

      setIsFormOpen(false);
      const sch = await scholarshipService.getScholarships(selectedOrgId);
      setScholarships(sch);
    } catch (err) {
      console.error('Save scholarship error:', err);
      onShowToast?.({ type: 'error', message: err.message || 'Failed to save scholarship.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await scholarshipService.deleteScholarship(selectedOrgId, deleteTarget.scholarship_id);
      onShowToast?.({ type: 'success', message: 'Scholarship program removed from directory.' });
      setDeleteTarget(null);
      const sch = await scholarshipService.getScholarships(selectedOrgId);
      setScholarships(sch);
    } catch (err) {
      console.error('Delete scholarship error:', err);
      onShowToast?.({ type: 'error', message: err.message || 'Failed to delete program.' });
    } finally {
      setDeleting(false);
    }
  }

  const selectedOrg = organizations.find((o) => o.organization_id === selectedOrgId);

  return (
    <div className="flex-col gap-lg">
      <PageHeading
        contextBadge="Consortium Foundation Registry"
        subBadge={selectedOrg?.organization_name || 'Organization Directory'}
        titleRegular="Scholarship"
        titleItalic="program directory."
        description="Catalog and explore authorized higher education scholarship programs sponsored by SBI Foundation, Tata Capital, and Reliance Foundation."
        actions={
          <button
            type="button"
            className="sl-btn sl-btn-primary sl-btn-sm"
            onClick={handleOpenCreate}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            <span>Add Program to {selectedOrg?.organization_name || 'Organization'}</span>
          </button>
        }
      />

      {/* Organization Tab Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderBottom: '1px solid var(--border-hairline)',
          paddingBottom: '12px',
          marginBottom: '20px',
        }}
      >
        {organizations.map((org) => {
          const isSelected = selectedOrgId === org.organization_id;
          return (
            <button
              key={org.organization_id}
              type="button"
              onClick={() => handleSelectOrg(org.organization_id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: isSelected ? '1px solid var(--primary-action)' : '1px solid var(--border-hairline)',
                backgroundColor: isSelected ? 'var(--surface-pale-blue)' : '#FFFFFF',
                color: isSelected ? 'var(--primary-action)' : 'var(--text-primary)',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                corporate_fare
              </span>
              <span>{org.organization_name}</span>
              <span className="sl-mono-chip" style={{ fontSize: '10px' }}>
                {org.organization_id}
              </span>
            </button>
          );
        })}
      </div>

      {loading && <LoadingState message="Fetching scholarship directory..." />}

      {error && !loading && (
        <ErrorState
          title="Directory Retrieval Error"
          message={error}
          onRetry={() => loadData(selectedOrgId)}
        />
      )}

      {!loading && !error && scholarships.length === 0 && (
        <EmptyState
          title="No Programs Registered"
          description={`No scholarship programs are currently cataloged under ${selectedOrg?.organization_name}.`}
          icon="school"
          actionLabel="Add Program"
          onAction={handleOpenCreate}
        />
      )}

      {/* Program Cards / Table */}
      {!loading && !error && scholarships.length > 0 && (
        <div className="sl-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedOrg?.organization_name} Programs ({scholarships.length})
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {selectedOrg?.organization_type} • Database Node: {selectedOrgId}
              </div>
            </div>
            <span className="sl-mono-chip">Confidential Secret Scrubbed</span>
          </div>

          <div className="sl-table-container">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>Program ID</th>
                  <th>Scholarship Program Name</th>
                  <th>Category / Type</th>
                  <th className="numeric">Maximum Grant Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scholarships.map((sch) => (
                  <tr key={sch.scholarship_id}>
                    <td>
                      <span className="sl-mono-chip">#{sch.scholarship_id}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {sch.scholarship_name}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--surface-neutral)',
                          fontFamily: 'var(--font-interface)',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {sch.scholarship_type || 'General'}
                      </span>
                    </td>
                    <td className="numeric font-mono" style={{ fontWeight: 600, color: 'var(--primary-action)' }}>
                      <CurrencyValue value={sch.maximum_amount} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          type="button"
                          className="sl-btn sl-btn-secondary sl-btn-sm"
                          onClick={() => handleOpenEdit(sch)}
                          title="Edit Program"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                        </button>
                        <button
                          type="button"
                          className="sl-btn sl-btn-destructive sl-btn-sm"
                          onClick={() => setDeleteTarget(sch)}
                          title="Delete Program"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="sl-modal-overlay" onClick={() => !saving && setIsFormOpen(false)}>
          <div className="sl-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isEditing ? `Edit Program #${editingId}` : `New Program — ${selectedOrg?.organization_name}`}
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
                <label className="sl-label" htmlFor="sch-name-field">Program Name</label>
                <input
                  id="sch-name-field"
                  className="sl-input"
                  value={formData.scholarshipName}
                  onChange={(e) => setFormData({ ...formData, scholarshipName: e.target.value })}
                  disabled={saving}
                  placeholder="e.g. Higher Education Need Fellowship"
                  required
                />
              </div>

              <div className="sl-input-group">
                <label className="sl-label" htmlFor="sch-type-field">Award Type</label>
                <select
                  id="sch-type-field"
                  className="sl-select"
                  value={formData.scholarshipType}
                  onChange={(e) => setFormData({ ...formData, scholarshipType: e.target.value })}
                  disabled={saving}
                >
                  <option value="Need-based">Need-based</option>
                  <option value="Merit-based">Merit-based</option>
                  <option value="STEM Special">STEM Special</option>
                  <option value="Corporate CSR">Corporate CSR</option>
                </select>
              </div>

              <div className="sl-input-group">
                <label className="sl-label" htmlFor="sch-amount-field">Maximum Grant Ceiling (INR)</label>
                <input
                  id="sch-amount-field"
                  className="sl-input font-mono"
                  type="number"
                  min="0"
                  step="5000"
                  value={formData.maximumAmount}
                  onChange={(e) => setFormData({ ...formData, maximumAmount: e.target.value })}
                  disabled={saving}
                  required
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
                  {saving ? 'Saving...' : isEditing ? 'Update Program' : 'Catalog Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Remove Scholarship Program"
        message={`Are you sure you want to delete "${deleteTarget?.scholarship_name}"? Existing student applications referencing this scholarship program may be affected.`}
        confirmLabel="Delete Program"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
