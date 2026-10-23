import React, { useState, useEffect } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import CurrencyValue, { formatINR } from '../components/CurrencyValue.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/FeedbackStates.jsx';
import { ConfirmDialog } from '../components/OverlayComponents.jsx';
import organizationService from '../services/organizationService.js';
import applicationService from '../services/applicationService.js';
import awardService from '../services/awardService.js';
import scholarshipService from '../services/scholarshipService.js';

export default function ApplicationsAwardsPage({ student, onShowToast }) {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('ORG001');
  const [activeSection, setActiveSection] = useState('applications'); // 'applications' | 'awards'
  
  const [applications, setApplications] = useState([]);
  const [awards, setAwards] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application Modal state
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [appForm, setAppForm] = useState({
    studentId: student?.student_id || 'STU1001',
    scholarshipId: 1,
    applicationDate: new Date().toISOString().split('T')[0],
    selfDeclaredPriorSupport: false,
    status: 'APPROVED',
  });

  // Award Modal state
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState(null);
  const [awardForm, setAwardForm] = useState({
    applicationId: 1,
    amount: '25000',
    awardDate: new Date().toISOString().split('T')[0],
    academicYear: '2026-27',
  });

  const [saving, setSaving] = useState(false);
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
        const [apps, awds, schs] = await Promise.all([
          applicationService.getAllApplications(targetId),
          awardService.getAllAwards(targetId),
          scholarshipService.getScholarships(targetId),
        ]);
        setApplications(apps);
        setAwards(awds);
        setScholarships(schs);
      }
    } catch (err) {
      console.error('Failed to load application/award records:', err);
      setError(err.message || 'Unable to retrieve records.');
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
      const [apps, awds, schs] = await Promise.all([
        applicationService.getAllApplications(orgId),
        awardService.getAllAwards(orgId),
        scholarshipService.getScholarships(orgId),
      ]);
      setApplications(apps);
      setAwards(awds);
      setScholarships(schs);
    } catch (err) {
      onShowToast?.({ type: 'error', message: err.message || 'Failed to switch organization.' });
    } finally {
      setLoading(false);
    }
  }

  // Application Handlers
  function handleOpenCreateApp() {
    setEditingApp(null);
    setAppForm({
      studentId: student?.student_id || 'STU1001',
      scholarshipId: scholarships[0]?.scholarship_id || 1,
      applicationDate: new Date().toISOString().split('T')[0],
      selfDeclaredPriorSupport: false,
      status: 'APPROVED',
    });
    setAppModalOpen(true);
  }

  function handleOpenEditApp(app) {
    setEditingApp(app);
    setAppForm({
      studentId: app.student_id,
      scholarshipId: app.scholarship_id,
      applicationDate: app.application_date ? String(app.application_date).slice(0, 10) : '',
      selfDeclaredPriorSupport: Boolean(app.self_declared_prior_support),
      status: app.status || 'APPROVED',
    });
    setAppModalOpen(true);
  }

  async function handleSubmitApp(e) {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingApp) {
        await applicationService.updateApplication(selectedOrgId, editingApp.application_id, {
          scholarshipId: appForm.scholarshipId,
          applicationDate: appForm.applicationDate,
          selfDeclaredPriorSupport: appForm.selfDeclaredPriorSupport,
          status: appForm.status,
        });
        onShowToast?.({ type: 'success', message: 'Application updated successfully.' });
      } else {
        await applicationService.createApplication(selectedOrgId, appForm);
        onShowToast?.({ type: 'success', message: 'New application recorded.' });
      }

      setAppModalOpen(false);
      const apps = await applicationService.getAllApplications(selectedOrgId);
      setApplications(apps);
    } catch (err) {
      onShowToast?.({ type: 'error', message: err.message || 'Failed to save application.' });
    } finally {
      setSaving(false);
    }
  }

  // Award Handlers
  function handleOpenCreateAward() {
    setEditingAward(null);
    setAwardForm({
      applicationId: applications[0]?.application_id || 1,
      amount: '25000',
      awardDate: new Date().toISOString().split('T')[0],
      academicYear: '2026-27',
    });
    setAwardModalOpen(true);
  }

  function handleOpenEditAward(awd) {
    setEditingAward(awd);
    setAwardForm({
      applicationId: awd.application_id,
      amount: String(awd.amount || '0'),
      awardDate: awd.award_date ? String(awd.award_date).slice(0, 10) : '',
      academicYear: awd.academic_year || '2026-27',
    });
    setAwardModalOpen(true);
  }

  async function handleSubmitAward(e) {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingAward) {
        await awardService.updateAward(selectedOrgId, editingAward.award_id, {
          amount: Number(awardForm.amount),
          awardDate: awardForm.awardDate,
          academicYear: awardForm.academicYear,
        });
        onShowToast?.({ type: 'success', message: 'Award record updated.' });
      } else {
        await awardService.createAward(selectedOrgId, {
          applicationId: Number(awardForm.applicationId),
          amount: Number(awardForm.amount),
          awardDate: awardForm.awardDate,
          academicYear: awardForm.academicYear,
        });
        onShowToast?.({ type: 'success', message: 'Grant disbursement award logged.' });
      }

      setAwardModalOpen(false);
      const awds = await awardService.getAllAwards(selectedOrgId);
      setAwards(awds);
    } catch (err) {
      onShowToast?.({ type: 'error', message: err.message || 'Failed to save award.' });
    } finally {
      setSaving(false);
    }
  }

  // Delete Handler
  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      if (deleteTarget.type === 'app') {
        await applicationService.deleteApplication(selectedOrgId, deleteTarget.item.application_id);
        onShowToast?.({ type: 'success', message: 'Application deleted.' });
        const apps = await applicationService.getAllApplications(selectedOrgId);
        setApplications(apps);
      } else {
        await awardService.deleteAward(selectedOrgId, deleteTarget.item.award_id);
        onShowToast?.({ type: 'success', message: 'Award disbursement deleted.' });
        const awds = await awardService.getAllAwards(selectedOrgId);
        setAwards(awds);
      }
      setDeleteTarget(null);
    } catch (err) {
      onShowToast?.({ type: 'error', message: err.message || 'Failed to delete.' });
    } finally {
      setDeleting(false);
    }
  }

  const selectedOrg = organizations.find((o) => o.organization_id === selectedOrgId);

  return (
    <div className="flex-col gap-lg">
      <PageHeading
        contextBadge="Organization Grant Clearinghouse"
        subBadge={selectedOrg?.organization_name || 'Applications & Awards'}
        titleRegular="Applications &"
        titleItalic="disbursement awards."
        description="Inspect and manage individual student scholarship application submissions and certified disbursement awards across independent foundation databases."
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeSection === 'applications' ? (
              <button
                type="button"
                className="sl-btn sl-btn-primary sl-btn-sm"
                onClick={handleOpenCreateApp}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                <span>Create Application</span>
              </button>
            ) : (
              <button
                type="button"
                className="sl-btn sl-btn-primary sl-btn-sm"
                onClick={handleOpenCreateAward}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>payments</span>
                <span>Log Grant Award</span>
              </button>
            )}
          </div>
        }
      />

      {/* Organization Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderBottom: '1px solid var(--border-hairline)',
          paddingBottom: '12px',
          marginBottom: '16px',
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
                padding: '6px 14px',
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
              <span>{org.organization_name}</span>
              <span className="sl-mono-chip" style={{ fontSize: '10px' }}>
                {org.organization_id}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tabs: Applications vs Awards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setActiveSection('applications')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeSection === 'applications' ? 'var(--text-primary)' : 'var(--surface-neutral)',
            color: activeSection === 'applications' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span>
          <span>Applications ({applications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('awards')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeSection === 'awards' ? 'var(--text-primary)' : 'var(--surface-neutral)',
            color: activeSection === 'awards' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>workspace_premium</span>
          <span>Awards & Disbursements ({awards.length})</span>
        </button>
      </div>

      {loading && <LoadingState message="Loading application & award records..." />}

      {error && !loading && (
        <ErrorState
          title="Data Retrieval Error"
          message={error}
          onRetry={() => loadData(selectedOrgId)}
        />
      )}

      {/* Applications Section */}
      {!loading && !error && activeSection === 'applications' && (
        <div className="sl-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {selectedOrg?.organization_name} — Student Applications
            </h3>
            <span className="sl-mono-chip">{selectedOrgId}</span>
          </div>

          {applications.length === 0 ? (
            <EmptyState
              title="No Applications Recorded"
              description={`There are no recorded student scholarship applications for ${selectedOrg?.organization_name}.`}
              icon="assignment"
              actionLabel="Create Application"
              onAction={handleOpenCreateApp}
            />
          ) : (
            <div className="sl-table-container">
              <table className="sl-table">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Student ID</th>
                    <th>Program ID</th>
                    <th>Application Date</th>
                    <th>Prior Support Declared</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.application_id}>
                      <td><span className="sl-mono-chip">#{app.application_id}</span></td>
                      <td style={{ fontWeight: 600 }}>{app.student_id}</td>
                      <td>Program #{app.scholarship_id}</td>
                      <td className="font-mono text-muted">
                        {app.application_date ? String(app.application_date).slice(0, 10) : '—'}
                      </td>
                      <td>
                        {app.self_declared_prior_support ? (
                          <span style={{ color: 'var(--status-pending)', fontWeight: 600 }}>Yes (Self-Declared)</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>No</span>
                        )}
                      </td>
                      <td><StatusBadge status={app.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            className="sl-btn sl-btn-secondary sl-btn-sm"
                            onClick={() => handleOpenEditApp(app)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                          </button>
                          <button
                            type="button"
                            className="sl-btn sl-btn-destructive sl-btn-sm"
                            onClick={() => setDeleteTarget({ type: 'app', item: app })}
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
          )}
        </div>
      )}

      {/* Awards Section */}
      {!loading && !error && activeSection === 'awards' && (
        <div className="sl-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {selectedOrg?.organization_name} — Certified Awards
            </h3>
            <span className="sl-mono-chip">{selectedOrgId}</span>
          </div>

          {awards.length === 0 ? (
            <EmptyState
              title="No Awards Logged"
              description={`There are no recorded grant awards for ${selectedOrg?.organization_name}.`}
              icon="workspace_premium"
              actionLabel="Log New Award"
              onAction={handleOpenCreateAward}
            />
          ) : (
            <div className="sl-table-container">
              <table className="sl-table">
                <thead>
                  <tr>
                    <th>Award ID</th>
                    <th>Linked App ID</th>
                    <th className="numeric">Award Amount</th>
                    <th>Award Date</th>
                    <th>Academic Year</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {awards.map((awd) => (
                    <tr key={awd.award_id}>
                      <td><span className="sl-mono-chip">#{awd.award_id}</span></td>
                      <td style={{ fontWeight: 600 }}>Application #{awd.application_id}</td>
                      <td className="numeric font-mono" style={{ fontWeight: 700, color: 'var(--status-verified)' }}>
                        <CurrencyValue value={awd.amount} />
                      </td>
                      <td className="font-mono text-muted">
                        {awd.award_date ? String(awd.award_date).slice(0, 10) : '—'}
                      </td>
                      <td>
                        <span className="sl-mono-chip" style={{ fontSize: '11px' }}>
                          {awd.academic_year}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            className="sl-btn sl-btn-secondary sl-btn-sm"
                            onClick={() => handleOpenEditAward(awd)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                          </button>
                          <button
                            type="button"
                            className="sl-btn sl-btn-destructive sl-btn-sm"
                            onClick={() => setDeleteTarget({ type: 'award', item: awd })}
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
          )}
        </div>
      )}

      {/* Application Form Modal */}
      {appModalOpen && (
        <div className="sl-modal-overlay" onClick={() => !saving && setAppModalOpen(false)}>
          <div className="sl-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {editingApp ? `Edit Application #${editingApp.application_id}` : 'Record New Scholarship Application'}
              </h3>
              <button
                type="button"
                onClick={() => setAppModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitApp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="sl-input-group">
                <label className="sl-label" htmlFor="app-student-field">Student Identifier</label>
                <input
                  id="app-student-field"
                  className="sl-input"
                  value={appForm.studentId}
                  onChange={(e) => setAppForm({ ...appForm, studentId: e.target.value })}
                  disabled={Boolean(editingApp) || saving}
                  placeholder="e.g. STU1001"
                  required
                />
              </div>

              <div className="sl-input-group">
                <label className="sl-label" htmlFor="app-program-field">Target Scholarship Program</label>
                <select
                  id="app-program-field"
                  className="sl-select"
                  value={appForm.scholarshipId}
                  onChange={(e) => setAppForm({ ...appForm, scholarshipId: Number(e.target.value) })}
                  disabled={saving}
                >
                  {scholarships.map((s) => (
                    <option key={s.scholarship_id} value={s.scholarship_id}>
                      #{s.scholarship_id} - {s.scholarship_name} (Max {formatINR(s.maximum_amount)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sl-input-group">
                <label className="sl-label" htmlFor="app-date-field">Application Submission Date</label>
                <input
                  id="app-date-field"
                  className="sl-input font-mono"
                  type="date"
                  value={appForm.applicationDate}
                  onChange={(e) => setAppForm({ ...appForm, applicationDate: e.target.value })}
                  disabled={saving}
                  required
                />
              </div>

              <div className="sl-input-group">
                <label className="sl-label" htmlFor="app-status-field">Application Status</label>
                <select
                  id="app-status-field"
                  className="sl-select"
                  value={appForm.status}
                  onChange={(e) => setAppForm({ ...appForm, status: e.target.value })}
                  disabled={saving}
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={appForm.selfDeclaredPriorSupport}
                  onChange={(e) => setAppForm({ ...appForm, selfDeclaredPriorSupport: e.target.checked })}
                  disabled={saving}
                  style={{ accentColor: 'var(--primary-action)' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>Student self-declared previous scholarship support</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="sl-btn sl-btn-secondary"
                  onClick={() => setAppModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sl-btn sl-btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingApp ? 'Update Application' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Award Form Modal */}
      {awardModalOpen && (
        <div className="sl-modal-overlay" onClick={() => !saving && setAwardModalOpen(false)}>
          <div className="sl-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {editingAward ? `Edit Award #${editingAward.award_id}` : 'Log Grant Award Disbursement'}
              </h3>
              <button
                type="button"
                onClick={() => setAwardModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitAward} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="sl-input-group">
                <label className="sl-label" htmlFor="award-app-field">Associated Application ID</label>
                <select
                  id="award-app-field"
                  className="sl-select"
                  value={awardForm.applicationId}
                  onChange={(e) => setAwardForm({ ...awardForm, applicationId: Number(e.target.value) })}
                  disabled={Boolean(editingAward) || saving}
                >
                  {applications.map((a) => (
                    <option key={a.application_id} value={a.application_id}>
                      App #{a.application_id} (Student: {a.student_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sl-input-group">
                <label className="sl-label" htmlFor="award-amount-field">Grant Award Amount (INR)</label>
                <input
                  id="award-amount-field"
                  className="sl-input font-mono"
                  type="number"
                  min="0"
                  step="1000"
                  value={awardForm.amount}
                  onChange={(e) => setAwardForm({ ...awardForm, amount: e.target.value })}
                  disabled={saving}
                  placeholder="e.g. 25000"
                  required
                />
              </div>

              <div className="sl-input-group">
                <label className="sl-label" htmlFor="award-date-field">Award Grant Date</label>
                <input
                  id="award-date-field"
                  className="sl-input font-mono"
                  type="date"
                  value={awardForm.awardDate}
                  onChange={(e) => setAwardForm({ ...awardForm, awardDate: e.target.value })}
                  disabled={saving}
                  required
                />
              </div>

              <div className="sl-input-group">
                <label className="sl-label" htmlFor="award-year-field">Academic Year</label>
                <input
                  id="award-year-field"
                  className="sl-input font-mono"
                  value={awardForm.academicYear}
                  onChange={(e) => setAwardForm({ ...awardForm, academicYear: e.target.value })}
                  disabled={saving}
                  placeholder="e.g. 2026-27"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="sl-btn sl-btn-secondary"
                  onClick={() => setAwardModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sl-btn sl-btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingAward ? 'Update Award' : 'Record Award'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.type === 'app' ? 'Delete Application' : 'Delete Award'}
        message={`Are you sure you want to permanently delete this ${deleteTarget?.type === 'app' ? 'application record' : 'award disbursement record'}?`}
        confirmLabel="Delete Record"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
