import React, { useState, useEffect } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import CurrencyValue, { formatINR } from '../components/CurrencyValue.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/FeedbackStates.jsx';
import organizationService from '../services/organizationService.js';
import scholarshipService from '../services/scholarshipService.js';

export default function StudentOrganizationDataPage({ student, onShowToast }) {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('ORG001');
  const [scholarships, setScholarships] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const studentId = student?.student_id || 'STU1001';

  async function loadData(orgId) {
    try {
      setLoading(true);
      setError(null);
      const orgs = await organizationService.getAllOrganizations();
      setOrganizations(orgs);

      const targetOrg = orgId || selectedOrgId || orgs[0]?.organization_id;
      if (targetOrg) {
        setSelectedOrgId(targetOrg);
        const [schs, sum] = await Promise.all([
          scholarshipService.getStudentScholarships(targetOrg, studentId),
          scholarshipService.getStudentAwardSummary(targetOrg, studentId),
        ]);
        setScholarships(schs);
        setSummary(sum);
      }
    } catch (err) {
      console.error('Failed to load student organization data:', err);
      setError(err.message || 'Unable to retrieve student scholarship records.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [studentId]);

  async function handleSelectOrg(orgId) {
    setSelectedOrgId(orgId);
    try {
      setLoading(true);
      const [schs, sum] = await Promise.all([
        scholarshipService.getStudentScholarships(orgId, studentId),
        scholarshipService.getStudentAwardSummary(orgId, studentId),
      ]);
      setScholarships(schs);
      setSummary(sum);
    } catch (err) {
      onShowToast?.({ type: 'error', message: err.message || 'Failed to query organization database.' });
    } finally {
      setLoading(false);
    }
  }

  const selectedOrg = organizations.find((o) => o.organization_id === selectedOrgId);
  const totalAwarded = Number(summary?.total_awarded) || 0;
  const numberOfAwards = Number(summary?.number_of_awards) || 0;

  return (
    <div className="flex-col gap-lg">
      <PageHeading
        contextBadge={`Student ID #${studentId} • ${student?.name || 'Selected Student'}`}
        subBadge={selectedOrg?.organization_name || 'Organization Query'}
        titleRegular="Single organization"
        titleItalic="scholarship records."
        description="View granular, student-specific scholarship applications, awarded grant tranches, and self-declared prior support directly retrieved from an individual organization's registry."
      />

      {/* Organization Tabs */}
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
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                assured_workload
              </span>
              <span>{org.organization_name}</span>
              <span className="sl-mono-chip" style={{ fontSize: '10px' }}>
                {org.organization_id}
              </span>
            </button>
          );
        })}
      </div>

      {loading && <LoadingState message={`Retrieving ${selectedOrg?.organization_name || 'organization'} records for student ${studentId}...`} />}

      {error && !loading && (
        <ErrorState
          title="Data Retrieval Error"
          message={error}
          onRetry={() => loadData(selectedOrgId)}
        />
      )}

      {!loading && !error && (
        <>
          {/* Organization Summary Cards */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div className="sl-card-neutral">
              <span className="sl-label">Total Amount Awarded</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                <CurrencyValue value={totalAwarded} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--status-verified)', fontWeight: 600, marginTop: '4px' }}>
                Certified by {selectedOrg?.organization_name}
              </div>
            </div>

            <div className="sl-card-neutral">
              <span className="sl-label">Number of Awards</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {numberOfAwards} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Tranches</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Disbursements credited to student balance
              </div>
            </div>

            <div className="sl-card-neutral">
              <span className="sl-label">Prior Support Declaration</span>
              <div style={{ fontSize: '20px', fontWeight: 700, color: summary?.has_declared_prior_support ? 'var(--status-pending)' : 'var(--status-verified)', marginTop: '6px' }}>
                {summary?.has_declared_prior_support ? 'Yes (Self-Declared)' : 'None Declared'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {summary?.declared_prior_support_applications || 0} application(s) declared prior support
              </div>
            </div>
          </section>

          {/* Granular Application & Award Records Table */}
          <section className="sl-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Granular Scholarship Records ({scholarships.length})
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Student {student?.name || studentId} at {selectedOrg?.organization_name}
                </div>
              </div>
              <span className="sl-mono-chip">Direct Central Bridge</span>
            </div>

            {scholarships.length === 0 ? (
              <EmptyState
                title="No Grant Records for this Student"
                description={`Student ${student?.name || studentId} has no recorded applications or awards in ${selectedOrg?.organization_name}.`}
                icon="folder_off"
              />
            ) : (
              <div className="sl-table-container">
                <table className="sl-table">
                  <thead>
                    <tr>
                      <th>App ID</th>
                      <th>Scholarship Program</th>
                      <th>Category</th>
                      <th>Application Date</th>
                      <th>Application Status</th>
                      <th>Award ID</th>
                      <th>Award Date</th>
                      <th>Academic Year</th>
                      <th className="numeric">Award Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scholarships.map((row, idx) => (
                      <tr key={`${row.application_id}-${row.award_id || idx}`}>
                        <td><span className="sl-mono-chip">#{row.application_id}</span></td>
                        <td style={{ fontWeight: 600 }}>{row.scholarship_name}</td>
                        <td>{row.scholarship_type || 'General'}</td>
                        <td className="font-mono text-muted" style={{ fontSize: '11px' }}>
                          {row.application_date ? String(row.application_date).slice(0, 10) : '—'}
                        </td>
                        <td><StatusBadge status={row.application_status} /></td>
                        <td>
                          {row.award_id ? (
                            <span className="sl-mono-chip">#{row.award_id}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td className="font-mono text-muted" style={{ fontSize: '11px' }}>
                          {row.award_date ? String(row.award_date).slice(0, 10) : '—'}
                        </td>
                        <td>
                          <span className="sl-mono-chip" style={{ fontSize: '11px' }}>
                            {row.academic_year || '—'}
                          </span>
                        </td>
                        <td className="numeric font-mono" style={{ fontWeight: 700, color: row.award_amount ? 'var(--status-verified)' : 'var(--text-muted)' }}>
                          {row.award_amount ? formatINR(row.award_amount) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: 'var(--surface-neutral)', fontWeight: 700 }}>
                      <td colSpan={8}>Total Awarded by {selectedOrg?.organization_name}</td>
                      <td className="numeric font-mono" style={{ color: 'var(--status-verified)', fontSize: '14px' }}>
                        {formatINR(totalAwarded)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
