import React, { useState, useEffect } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/FeedbackStates.jsx';
import queryService from '../services/queryService.js';
import consentService from '../services/consentService.js';

export default function QueryHistoryPage({
  student,
  onSetActiveQueryId,
  onNavigate,
  onShowToast,
}) {
  const [queries, setQueries] = useState([]);
  const [filterStudentOnly, setFilterStudentOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selected Query Details Modal
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [queryConsent, setQueryConsent] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Status edit modal
  const [statusEditQuery, setStatusEditQuery] = useState(null);
  const [newStatus, setNewStatus] = useState('INITIATED');
  const [savingStatus, setSavingStatus] = useState(false);

  const studentId = student?.student_id || 'STU1001';

  async function loadQueries() {
    try {
      setLoading(true);
      setError(null);
      let list = [];
      if (filterStudentOnly) {
        list = await queryService.getQueriesByStudent(studentId);
      } else {
        list = await queryService.getAllQueries();
      }
      setQueries(list);
    } catch (err) {
      console.error('Failed to load queries:', err);
      setError(err.message || 'Unable to retrieve query logs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueries();
  }, [filterStudentOnly, studentId]);

  async function handleOpenDetails(q) {
    try {
      setDetailsLoading(true);
      const fullQuery = await queryService.getQueryById(q.query_id);
      setSelectedQuery(fullQuery);

      const consentData = await consentService.getConsent(q.query_id);
      setQueryConsent(consentData);
    } catch (err) {
      console.error('Failed to load query details:', err);
      onShowToast?.({ type: 'error', message: err.message || 'Failed to load query details.' });
    } finally {
      setDetailsLoading(false);
    }
  }

  function handleOpenStatusEdit(q) {
    setStatusEditQuery(q);
    setNewStatus(q.status);
  }

  async function handleSaveStatus(e) {
    e.preventDefault();
    if (!statusEditQuery) return;

    try {
      setSavingStatus(true);
      await queryService.updateQueryStatus(statusEditQuery.query_id, newStatus);
      onShowToast?.({ type: 'success', message: `Query #${statusEditQuery.query_id} status updated to ${newStatus}.` });
      setStatusEditQuery(null);
      await loadQueries();
    } catch (err) {
      onShowToast?.({ type: 'error', message: err.message || 'Failed to update status.' });
    } finally {
      setSavingStatus(false);
    }
  }

  function handleContinueWorkflow(q) {
    onSetActiveQueryId?.(q.query_id);
    if (q.status === 'CONSENT_GRANTED' || q.status === 'LOOKUP_COMPLETED' || q.status === 'LOOKUP_PARTIAL') {
      onNavigate('results');
    } else {
      onNavigate('consent');
    }
  }

  return (
    <div className="flex-col gap-lg">
      <PageHeading
        contextBadge="Audit Trail & Query Log"
        subBadge="Central Exchange Registry"
        titleRegular="Federated"
        titleItalic="query history."
        description="Inspect and track all student scholarship inquiry transactions, consent timestamps, and federated lookup execution logs."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterStudentOnly}
                onChange={(e) => setFilterStudentOnly(e.target.checked)}
                style={{ accentColor: 'var(--primary-action)' }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>Filter for {student?.name || studentId} only</span>
            </label>
            <button
              type="button"
              className="sl-btn sl-btn-secondary sl-btn-sm"
              onClick={loadQueries}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
              <span>Refresh Log</span>
            </button>
          </div>
        }
      />

      {loading && <LoadingState message="Fetching audit query log records..." />}

      {error && !loading && (
        <ErrorState
          title="Query Log Retrieval Error"
          message={error}
          onRetry={loadQueries}
        />
      )}

      {!loading && !error && queries.length === 0 && (
        <EmptyState
          title="No Queries Logged"
          description={filterStudentOnly ? `No query history records found for student ${studentId}.` : 'No query records are currently logged in the central database.'}
          icon="history"
          actionLabel="Create Consent Query"
          onAction={() => onNavigate('consent')}
        />
      )}

      {!loading && !error && queries.length > 0 && (
        <div className="sl-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Transaction Log ({queries.length} Queries)
            </h3>
            <span className="sl-mono-chip">Immutable Audit Trail</span>
          </div>

          <div className="sl-table-container">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>Query ID</th>
                  <th>Student ID</th>
                  <th>Purpose</th>
                  <th>Creation Timestamp</th>
                  <th>Query Status</th>
                  <th style={{ textAlign: 'right' }}>Workflow Actions</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((q) => (
                  <tr key={q.query_id}>
                    <td>
                      <span className="sl-mono-chip" style={{ fontWeight: 600 }}>
                        #{q.query_id}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{q.student_id}</td>
                    <td style={{ maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
                      {q.purpose}
                    </td>
                    <td className="font-mono text-muted" style={{ fontSize: '11px' }}>
                      {q.query_time ? String(q.query_time).replace('T', ' ').slice(0, 19) : '—'}
                    </td>
                    <td>
                      <StatusBadge status={q.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          type="button"
                          className="sl-btn sl-btn-secondary sl-btn-sm"
                          onClick={() => handleOpenDetails(q)}
                          title="View Details"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
                        </button>
                        <button
                          type="button"
                          className="sl-btn sl-btn-secondary sl-btn-sm"
                          onClick={() => handleOpenStatusEdit(q)}
                          title="Update Status"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit_note</span>
                        </button>
                        <button
                          type="button"
                          className="sl-btn sl-btn-primary sl-btn-sm"
                          onClick={() => handleContinueWorkflow(q)}
                          title="Continue to workflow"
                        >
                          <span>Continue</span>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
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

      {/* Query Details Modal */}
      {selectedQuery && (
        <div className="sl-modal-overlay" onClick={() => setSelectedQuery(null)}>
          <div className="sl-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-action)' }}>
                  manage_search
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Query Transaction #{selectedQuery.query_id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuery(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: 'var(--surface-neutral)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <span className="sl-label">Student ID</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedQuery.student_id}</div>
                </div>
                <div>
                  <span className="sl-label">Primary Organization</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedQuery.organization_id || 'Consortium'}</div>
                </div>
                <div>
                  <span className="sl-label">Query Status</span>
                  <div style={{ marginTop: '2px' }}><StatusBadge status={selectedQuery.status} /></div>
                </div>
                <div>
                  <span className="sl-label">Timestamp</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {selectedQuery.query_time ? String(selectedQuery.query_time).replace('T', ' ').slice(0, 19) : '—'}
                  </div>
                </div>
              </div>

              <div>
                <span className="sl-label">Inquiry Purpose</span>
                <p style={{ marginTop: '4px', color: 'var(--text-primary)', lineHeight: 1.5, backgroundColor: 'var(--surface-neutral)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  {selectedQuery.purpose}
                </p>
              </div>

              {/* Consent Information */}
              <div style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: '12px' }}>
                <span className="sl-label" style={{ marginBottom: '6px', display: 'block' }}>
                  Associated Consent Record
                </span>
                {queryConsent ? (
                  <div style={{ backgroundColor: 'var(--surface-neutral)', padding: '12px', borderRadius: 'var(--radius-sm)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <span className="sl-label" style={{ fontSize: '10px' }}>Consent ID</span>
                      <div className="font-mono">{queryConsent.consent_id}</div>
                    </div>
                    <div>
                      <span className="sl-label" style={{ fontSize: '10px' }}>OTP Status</span>
                      <div><StatusBadge status={queryConsent.otp_status} /></div>
                    </div>
                    <div>
                      <span className="sl-label" style={{ fontSize: '10px' }}>Consent Time</span>
                      <div className="font-mono text-muted" style={{ fontSize: '11px' }}>
                        {queryConsent.consent_time ? String(queryConsent.consent_time).slice(0, 19).replace('T', ' ') : '—'}
                      </div>
                    </div>
                    <div>
                      <span className="sl-label" style={{ fontSize: '10px' }}>Valid Until</span>
                      <div className="font-mono text-muted" style={{ fontSize: '11px' }}>
                        {queryConsent.valid_until ? String(queryConsent.valid_until).slice(0, 19).replace('T', ' ') : '—'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
                    No consent record requested yet for this query.
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="sl-btn sl-btn-secondary"
                onClick={() => setSelectedQuery(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="sl-btn sl-btn-primary"
                onClick={() => {
                  const q = selectedQuery;
                  setSelectedQuery(null);
                  handleContinueWorkflow(q);
                }}
              >
                Continue Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusEditQuery && (
        <div className="sl-modal-overlay" onClick={() => !savingStatus && setStatusEditQuery(null)}>
          <div className="sl-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Update Query Status — #{statusEditQuery.query_id}
              </h3>
              <button
                type="button"
                onClick={() => setStatusEditQuery(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveStatus} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="sl-input-group">
                <label className="sl-label" htmlFor="new-status-field">Select New Transaction Status</label>
                <select
                  id="new-status-field"
                  className="sl-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={savingStatus}
                >
                  <option value="INITIATED">INITIATED</option>
                  <option value="CONSENT_REQUESTED">CONSENT_REQUESTED</option>
                  <option value="CONSENT_GRANTED">CONSENT_GRANTED</option>
                  <option value="CONSENT_DENIED">CONSENT_DENIED</option>
                  <option value="LOOKUP_COMPLETED">LOOKUP_COMPLETED</option>
                  <option value="LOOKUP_PARTIAL">LOOKUP_PARTIAL</option>
                  <option value="LOOKUP_FAILED">LOOKUP_FAILED</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="sl-btn sl-btn-secondary"
                  onClick={() => setStatusEditQuery(null)}
                  disabled={savingStatus}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sl-btn sl-btn-primary"
                  disabled={savingStatus}
                >
                  {savingStatus ? 'Updating...' : 'Save New Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
