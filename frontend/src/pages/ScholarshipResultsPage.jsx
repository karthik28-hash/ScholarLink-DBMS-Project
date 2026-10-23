import React, { useState, useEffect } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import CurrencyValue, { formatINR } from '../components/CurrencyValue.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/FeedbackStates.jsx';
import federationService from '../services/federationService.js';
import queryService from '../services/queryService.js';

export default function ScholarshipResultsPage({
  student,
  activeQueryId,
  onNavigate,
  onShowToast,
}) {
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [lookupResult, setLookupResult] = useState(null);
  const [activeQuery, setActiveQuery] = useState(null);
  const [recentQueries, setRecentQueries] = useState([]);

  const studentId = student?.student_id || 'STU1001';

  // Load queries for this student
  useEffect(() => {
    async function loadStudentQueries() {
      try {
        const queries = await queryService.getQueriesByStudent(studentId);
        setRecentQueries(queries);

        // Find the best query: either activeQueryId or the most recent verified one
        let targetQId = activeQueryId;
        if (!targetQId && queries.length > 0) {
          const verified = queries.find(
            (q) => q.status === 'CONSENT_GRANTED' || q.status === 'LOOKUP_COMPLETED' || q.status === 'LOOKUP_PARTIAL'
          );
          targetQId = verified ? verified.query_id : queries[0].query_id;
        }

        if (targetQId) {
          const q = await queryService.getQueryById(targetQId);
          setActiveQuery(q);
          // If query has consent, run lookup
          if (q.status === 'CONSENT_GRANTED' || q.status === 'LOOKUP_COMPLETED' || q.status === 'LOOKUP_PARTIAL') {
            runLookup(targetQId);
          }
        }
      } catch (err) {
        console.error('Failed to load student queries:', err);
      }
    }
    loadStudentQueries();
  }, [studentId, activeQueryId]);

  async function runLookup(qIdToRun) {
    const qId = qIdToRun || activeQuery?.query_id || activeQueryId;
    if (!qId) {
      setError('No query selected. Please initiate a verified query first.');
      return;
    }

    try {
      setExecuting(true);
      setError(null);

      const result = await federationService.performFederatedLookup({
        studentId,
        queryId: qId,
      });

      setLookupResult(result);
      onShowToast?.({
        type: result.status === 'LOOKUP_COMPLETED' ? 'success' : 'info',
        title: 'Federated Lookup Finished',
        message: `Status: ${result.status}. ${result.summary?.organizationsResponded || 0} organizations responded.`,
      });
    } catch (err) {
      console.error('Federated lookup failed:', err);
      setError(err.message || 'Federated lookup failed. Ensure organization server nodes are online.');
      onShowToast?.({ type: 'error', message: err.message || 'Lookup failed' });
    } finally {
      setExecuting(false);
    }
  }

  // If query is not yet consented
  const isConsentNeeded =
    activeQuery &&
    activeQuery.status !== 'CONSENT_GRANTED' &&
    activeQuery.status !== 'LOOKUP_COMPLETED' &&
    activeQuery.status !== 'LOOKUP_PARTIAL';

  return (
    <div className="flex-col gap-lg">
      <PageHeading
        contextBadge={`Academic Year 2026–27 • ${student?.college_name || 'Institution'}`}
        subBadge={activeQuery ? `Audit Query #${activeQuery.query_id}` : 'Federated Audit Node'}
        titleRegular="Federated scholarship"
        titleItalic="verification results."
        description="Independent foundation registries queried concurrently across SBI Foundation, Tata Capital, and Reliance Foundation. Recorded grant awards and prior declared assistance are consolidated below."
        actions={
          <>
            <button
              type="button"
              className="sl-btn sl-btn-secondary sl-btn-sm"
              onClick={() => runLookup()}
              disabled={executing || !activeQuery || isConsentNeeded}
            >
              <span className={`material-symbols-outlined ${executing ? 'animate-spin' : ''}`} style={{ fontSize: '16px' }}>
                sync
              </span>
              <span>{executing ? 'Querying Foundation Nodes...' : 'Re-Check Nodes'}</span>
            </button>
            <button
              type="button"
              className="sl-btn sl-btn-primary sl-btn-sm"
              onClick={() => onNavigate('funding-gap')}
              disabled={!lookupResult}
            >
              <span>View Funding Gap Analysis</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </>
        }
      />

      {/* Query Selector Bar if multiple queries exist */}
      {recentQueries.length > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-neutral)',
            border: '1px solid var(--border-hairline)',
            fontSize: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            Select Query Context:
          </span>
          {recentQueries.map((q) => {
            const isSelected = activeQuery?.query_id === q.query_id;
            return (
              <button
                key={q.query_id}
                type="button"
                onClick={() => {
                  setActiveQuery(q);
                  runLookup(q.query_id);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? '1px solid var(--primary-action)' : '1px solid var(--border-hairline)',
                  backgroundColor: isSelected ? 'var(--surface-pale-blue)' : '#FFFFFF',
                  color: isSelected ? 'var(--primary-action)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                #{q.query_id} ({q.status})
              </button>
            );
          })}
        </div>
      )}

      {/* Consent Needed Warning Banner */}
      {isConsentNeeded && (
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--status-pending-bg)',
            border: '1px solid var(--status-pending-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--status-pending)', fontSize: '24px' }}>
              lock
            </span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                Consent Verification Required
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Query #{activeQuery?.query_id} status is <strong>{activeQuery?.status}</strong>. The central federation engine requires student consent to be verified via OTP prior to querying organization APIs.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="sl-btn sl-btn-primary sl-btn-sm"
            onClick={() => onNavigate('consent')}
          >
            <span>Verify Consent via OTP</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <ErrorState
          title="Federated Lookup Error"
          message={error}
          onRetry={() => runLookup()}
        />
      )}

      {/* Loading */}
      {executing && (
        <LoadingState message="Executing concurrent federated queries across SBI, Tata Capital, and Reliance Foundation API nodes..." />
      )}

      {/* Main Results View */}
      {lookupResult && !executing && (
        <>
          {/* Summary Quorum & Metric Callout Surface */}
          <section className="sl-card-neutral" style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px',
              }}
            >
              {/* Total Assistance Metric */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '4px', height: '56px', backgroundColor: 'var(--status-verified)', borderRadius: '2px', flexShrink: 0 }} />
                <div>
                  <span className="sl-label">Total Recorded Assistance</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <CurrencyValue value={lookupResult.summary?.totalScholarshipAssistance} />
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>INR</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--status-verified)', fontWeight: 600 }}>
                    {lookupResult.summary?.totalAwards || 0} Total Award Records Found
                  </span>
                </div>
              </div>

              {/* Node Verification Count */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '4px', height: '56px', backgroundColor: 'var(--primary-action)', borderRadius: '2px', flexShrink: 0 }} />
                <div>
                  <span className="sl-label">Registry Inflow Status</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {lookupResult.summary?.organizationsResponded || 0} of {lookupResult.summary?.organizationsRequested || 0}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Organizations Responded</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {lookupResult.summary?.organizationsFailed === 0
                      ? 'Full response quorum achieved'
                      : `${lookupResult.summary?.organizationsFailed} node(s) failed or timed out`}
                  </span>
                </div>
              </div>

              {/* Status Badge Callout */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '4px', height: '56px', backgroundColor: lookupResult.status === 'LOOKUP_COMPLETED' ? 'var(--status-verified)' : 'var(--status-pending)', borderRadius: '2px', flexShrink: 0 }} />
                <div>
                  <span className="sl-label">Central Lookup Verdict</span>
                  <div style={{ marginTop: '6px' }}>
                    <StatusBadge
                      status={lookupResult.status}
                      label={
                        lookupResult.status === 'LOOKUP_COMPLETED'
                          ? 'All Nodes Completed'
                          : lookupResult.status === 'LOOKUP_PARTIAL'
                          ? 'Partial Results Received'
                          : 'Lookup Failed'
                      }
                    />
                  </div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Query ID: #{lookupResult.queryId}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Organization Results Cards */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Organization Registry Responses
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px',
              }}
            >
              {lookupResult.organizations?.map((org) => {
                const isCompleted = org.status === 'COMPLETED';
                const total = Number(org.totalAwarded) || 0;
                const awards = Number(org.numberOfAwards) || 0;

                return (
                  <div
                    key={org.organizationId}
                    className="sl-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderLeft: `4px solid ${isCompleted ? 'var(--status-verified)' : 'var(--status-gap)'}`,
                    }}
                  >
                    <div>
                      {/* Org Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {org.organizationName}
                            </h3>
                            <span className="sl-mono-chip" style={{ fontSize: '10px' }}>
                              {org.organizationId}
                            </span>
                          </div>
                        </div>
                        <StatusBadge
                          status={isCompleted ? 'COMPLETED' : 'FAILED'}
                          label={isCompleted ? 'Responded' : 'Failed'}
                        />
                      </div>

                      {/* Financial Value or Error */}
                      {isCompleted ? (
                        <div style={{ margin: '14px 0' }}>
                          <span className="sl-label">Total Awarded Amount</span>
                          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                            <CurrencyValue value={total} />
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {awards} {awards === 1 ? 'Award Record' : 'Award Records'} on file
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            margin: '12px 0',
                            padding: '10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--status-gap-bg)',
                            color: 'var(--status-gap)',
                            fontSize: '12px',
                          }}
                        >
                          <strong>Error:</strong> {org.error || 'Organization API returned non-200 response.'}
                        </div>
                      )}

                      {/* Prior Support Indicators */}
                      {isCompleted && (
                        <div
                          style={{
                            padding: '10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--surface-neutral)',
                            border: '1px solid var(--border-hairline)',
                            fontSize: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Declared Prior Support:</span>
                            <span style={{ fontWeight: 600, color: org.hasDeclaredPriorSupport ? 'var(--status-pending)' : 'var(--status-verified)' }}>
                              {org.hasDeclaredPriorSupport ? 'Yes (Self-Declared)' : 'None Declared'}
                            </span>
                          </div>
                          {org.declaredPriorSupportApplications > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Declared Applications:</span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                {org.declaredPriorSupportApplications}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-hairline)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      Audited via federated API endpoint
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit-Style Aligned Ledger Table */}
          <section className="sl-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Consolidated Organization Audit Ledger
              </h3>
              <span className="sl-mono-chip">Academic Year 2026–27</span>
            </div>

            <div className="sl-table-container">
              <table className="sl-table">
                <thead>
                  <tr>
                    <th>Organization Node</th>
                    <th>Node ID</th>
                    <th>API Status</th>
                    <th className="numeric">Awards</th>
                    <th>Prior Support Declared</th>
                    <th className="numeric">Total Awarded (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {lookupResult.organizations?.map((org) => (
                    <tr key={org.organizationId}>
                      <td style={{ fontWeight: 600 }}>{org.organizationName}</td>
                      <td>
                        <span className="sl-mono-chip" style={{ fontSize: '11px' }}>
                          {org.organizationId}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={org.status} />
                      </td>
                      <td className="numeric font-mono">
                        {org.status === 'COMPLETED' ? org.numberOfAwards : '—'}
                      </td>
                      <td>
                        {org.status === 'COMPLETED' ? (
                          org.hasDeclaredPriorSupport ? (
                            <span style={{ color: 'var(--status-pending)', fontWeight: 600, fontSize: '12px' }}>
                              Declared ({org.declaredPriorSupportApplications})
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>None</span>
                          )
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="numeric font-mono" style={{ fontWeight: 600 }}>
                        {org.status === 'COMPLETED' ? formatINR(org.totalAwarded) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--surface-neutral)', fontWeight: 700 }}>
                    <td colSpan={3}>Consortium Total</td>
                    <td className="numeric font-mono">
                      {lookupResult.summary?.totalAwards || 0}
                    </td>
                    <td>—</td>
                    <td className="numeric font-mono" style={{ color: 'var(--primary-action)', fontSize: '14px' }}>
                      {formatINR(lookupResult.summary?.totalScholarshipAssistance || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              * Prior support fields indicate past financial support declared in application forms. They do not constitute determination of ineligibility or double funding.
            </div>
          </section>
        </>
      )}

      {/* Empty / Unexecuted State */}
      {!lookupResult && !executing && !error && !isConsentNeeded && (
        <EmptyState
          title="No Federated Lookup Executed"
          description="Click 'Re-Check Nodes' above to run a federated scholarship lookup across the three organization APIs."
          icon="manage_search"
          actionLabel="Run Federated Lookup Now"
          onAction={() => runLookup()}
        />
      )}
    </div>
  );
}
