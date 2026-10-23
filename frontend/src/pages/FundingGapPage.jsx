import React, { useState, useEffect } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import CurrencyValue, { formatINR } from '../components/CurrencyValue.jsx';
import FundingProgress from '../components/FundingProgress.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/FeedbackStates.jsx';
import federationService from '../services/federationService.js';
import queryService from '../services/queryService.js';

export default function FundingGapPage({
  student,
  activeQueryId,
  onNavigate,
  onShowToast,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gapData, setGapData] = useState(null);
  const [activeQuery, setActiveQuery] = useState(null);
  const [recentQueries, setRecentQueries] = useState([]);
  const [academicYear, setAcademicYear] = useState('2026-27');

  const studentId = student?.student_id || 'STU1001';

  // Load queries and calculate funding gap
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const queries = await queryService.getQueriesByStudent(studentId);
        setRecentQueries(queries);

        // Find candidate query: activeQueryId or latest verified query
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

          if (q.status === 'CONSENT_GRANTED' || q.status === 'LOOKUP_COMPLETED' || q.status === 'LOOKUP_PARTIAL') {
            await calculateGap(targetQId);
          } else {
            setError(`Query #${targetQId} is in status ${q.status}. Consent must be verified before calculating the funding gap.`);
          }
        } else {
          setError('No verification query found for this student. Please initiate consent verification first.');
        }
      } catch (err) {
        console.error('Failed to load funding gap data:', err);
        setError(err.message || 'Unable to calculate funding gap.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [studentId, activeQueryId, academicYear]);

  async function calculateGap(qId) {
    try {
      setLoading(true);
      setError(null);

      const res = await federationService.calculateFundingGap({
        studentId,
        queryId: qId,
        academicYear,
      });

      setGapData(res);
      onShowToast?.({
        type: 'success',
        title: 'Funding Gap Analyzed',
        message: `Status: ${res.scholarshipInformation?.fundingAdequacyStatus || 'Calculated'}`,
      });
    } catch (err) {
      console.error('Funding gap calculation error:', err);
      setError(err.message || 'Failed to estimate funding gap.');
    } finally {
      setLoading(false);
    }
  }

  const fin = gapData?.financialInformation;
  const sch = gapData?.scholarshipInformation;
  const st = gapData?.student;

  const totalCost = Number(fin?.estimatedEducationCost) || 0;
  const totalAssistance = Number(sch?.totalScholarshipAssistance) || 0;
  const fundingGap = Number(sch?.estimatedFundingGap) || 0;
  const surplus = Number(sch?.amountExceedingEstimatedCost) || 0;
  const adequacyStatus = sch?.fundingAdequacyStatus || 'UNKNOWN';

  return (
    <div className="flex-col gap-lg">
      <PageHeading
        contextBadge={`Academic Year ${academicYear} • ${st?.college || student?.college_name || 'Institution Ledger'}`}
        subBadge={`Query #${activeQuery?.query_id || activeQueryId || '—'}`}
        titleRegular="Institutional liability &"
        titleItalic="funding gap details."
        description="Detailed analytical reconciliation of your academic expenses against verified foundation grants returned by the federated clearinghouse."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              className="sl-select"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
            >
              <option value="2026-27">AY 2026-27</option>
              <option value="2025-26">AY 2025-26</option>
            </select>
            <button
              type="button"
              className="sl-btn sl-btn-secondary sl-btn-sm"
              onClick={() => activeQuery && calculateGap(activeQuery.query_id)}
              disabled={loading || !activeQuery}
            >
              <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`} style={{ fontSize: '16px' }}>
                refresh
              </span>
              <span>Recalculate</span>
            </button>
          </div>
        }
      />

      {loading && (
        <LoadingState message="Reconciling academic expenses and verified grants across organization databases..." />
      )}

      {error && !loading && (
        <div style={{ marginBottom: '24px' }}>
          <ErrorState
            title="Funding Gap Analysis Notice"
            message={error}
            onRetry={activeQuery ? () => calculateGap(activeQuery.query_id) : undefined}
          />
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="sl-btn sl-btn-primary sl-btn-sm"
              onClick={() => onNavigate('consent')}
            >
              <span>Go to Consent Verification</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
            <button
              type="button"
              className="sl-btn sl-btn-secondary sl-btn-sm"
              onClick={() => onNavigate('financial-profile')}
            >
              <span>Review Financial Profile</span>
            </button>
          </div>
        </div>
      )}

      {gapData && !loading && (
        <>
          {/* Top Status & Summary Surface */}
          <section className="sl-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-hairline)' }}>
              <div>
                <span className="sl-label">Funding Adequacy Status</span>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status={adequacyStatus} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                  <span className="sl-label">Annual Course Fee</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <CurrencyValue value={fin?.annualCourseFee} />
                  </div>
                </div>

                <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-hairline)' }} />

                <div>
                  <span className="sl-label">Other Education Expenses</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <CurrencyValue value={fin?.otherEducationExpenses} />
                  </div>
                </div>

                <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-hairline)' }} />

                <div>
                  <span className="sl-label">Total Estimated Cost</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <CurrencyValue value={totalCost} />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Proportional Allocation Bar */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="sl-label">Education Cost vs. Recorded Assistance</span>
                <span className="sl-mono-chip" style={{ fontSize: '11px' }}>
                  {totalCost > 0 ? `${Math.round((totalAssistance / totalCost) * 100)}% Coverage` : '—'}
                </span>
              </div>

              <FundingProgress
                totalCost={totalCost}
                assistance={totalAssistance}
                gap={fundingGap}
                surplus={surplus}
                height={18}
              />
            </div>

            {/* Key Metric Pair */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-hairline)',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface-neutral)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-action)' }} />
                  <span className="sl-label">Recorded Scholarship Assistance</span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  <CurrencyValue value={totalAssistance} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--status-verified)', fontWeight: 600 }}>
                  Active Consortium Disbursements
                </span>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: fundingGap > 0 ? 'var(--status-gap-bg)' : 'var(--status-verified-bg)',
                  border: `1px solid ${fundingGap > 0 ? 'var(--status-gap-border)' : 'var(--status-verified-border)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: fundingGap > 0 ? 'var(--status-gap)' : 'var(--status-verified)' }} />
                  <span className="sl-label" style={{ color: fundingGap > 0 ? 'var(--status-gap)' : 'var(--status-verified)' }}>
                    {fundingGap > 0 ? 'Remaining Funding Gap' : 'Assistance Surplus'}
                  </span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: fundingGap > 0 ? 'var(--status-gap)' : 'var(--status-verified)' }}>
                  <CurrencyValue value={fundingGap > 0 ? fundingGap : surplus} />
                </div>
                <span style={{ fontSize: '12px', color: fundingGap > 0 ? 'var(--status-gap)' : 'var(--status-verified)' }}>
                  {fundingGap > 0 ? 'Unfunded balance remaining' : 'Grants fully cover assessed costs'}
                </span>
              </div>
            </div>
          </section>

          {/* Breakdown Table & Attribution Matrix */}
          <section className="sl-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span className="sl-label">Institutional Ledger Breakdown</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Deficit Attribution Matrix
                </h3>
              </div>
              <span className="sl-mono-chip">Audit Standard</span>
            </div>

            <div className="sl-table-container">
              <table className="sl-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Details</th>
                    <th className="numeric">Institutional Assessment</th>
                    <th className="numeric">Verified Assistance</th>
                    <th className="numeric">Net Funding Gap</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Annual Course Tuition</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {st?.course || student?.course_name || 'Academic Degree Program'} ({st?.degree || 'Degree'})
                    </td>
                    <td className="numeric font-mono">{formatINR(fin?.annualCourseFee)}</td>
                    <td className="numeric font-mono" style={{ color: 'var(--status-verified)' }}>
                      ({formatINR(totalAssistance)})
                    </td>
                    <td className="numeric font-mono" style={{ color: fundingGap > 0 ? 'var(--status-gap)' : 'var(--text-primary)', fontWeight: 600 }}>
                      {formatINR(Math.max(0, (Number(fin?.annualCourseFee) || 0) - totalAssistance))}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Other Education Expenses</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      Living, Books, Technology & Academic Amenities
                    </td>
                    <td className="numeric font-mono">{formatINR(fin?.otherEducationExpenses)}</td>
                    <td className="numeric font-mono" style={{ color: 'var(--text-muted)' }}>—</td>
                    <td className="numeric font-mono" style={{ color: 'var(--status-gap)', fontWeight: 600 }}>
                      {formatINR(fin?.otherEducationExpenses)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--surface-neutral)', fontWeight: 700 }}>
                    <td colSpan={2}>Reconciled Total Net Deficit</td>
                    <td className="numeric font-mono">{formatINR(totalCost)}</td>
                    <td className="numeric font-mono" style={{ color: 'var(--status-verified)' }}>
                      ({formatINR(totalAssistance)})
                    </td>
                    <td className="numeric font-mono" style={{ color: fundingGap > 0 ? 'var(--status-gap)' : 'var(--status-verified)', fontSize: '14px' }}>
                      {formatINR(fundingGap)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Official Disclaimer Note from Backend */}
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-neutral)',
                border: '1px solid var(--border-hairline)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--text-muted)' }}>
                info
              </span>
              <span>{gapData.note}</span>
            </div>
          </section>

          {/* Supported Action Pathways (Replacing unsupported external loan/grant schemes) */}
          <section className="sl-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Supported Resolution Pathways
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Take actionable steps within the ScholarLink system to manage your academic funding profile and grant inquiries:
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
              }}
            >
              <div
                className="sl-card-neutral"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-action)', marginBottom: '6px' }}>
                    <span className="material-symbols-outlined">dashboard</span>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Return to Funding Overview</h4>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Review your primary student dashboard, semester commitment summaries, and institutional balance.
                  </p>
                </div>
                <button
                  type="button"
                  className="sl-btn sl-btn-secondary sl-btn-sm"
                  onClick={() => onNavigate('dashboard')}
                >
                  Go to Overview
                </button>
              </div>

              <div
                className="sl-card-neutral"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-verified)', marginBottom: '6px' }}>
                    <span className="material-symbols-outlined">verified</span>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Review Verification Results</h4>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Examine organization-by-organization award totals, response flags, and declared prior support records.
                  </p>
                </div>
                <button
                  type="button"
                  className="sl-btn sl-btn-secondary sl-btn-sm"
                  onClick={() => onNavigate('results')}
                >
                  View Verification Results
                </button>
              </div>

              <div
                className="sl-card-neutral"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-action)', marginBottom: '6px' }}>
                    <span className="material-symbols-outlined">send</span>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Initiate New Consent Query</h4>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Formulate a refreshed consent token and re-query partner foundation databases with updated parameters.
                  </p>
                </div>
                <button
                  type="button"
                  className="sl-btn sl-btn-primary sl-btn-sm"
                  onClick={() => onNavigate('consent')}
                >
                  New Consent Query
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
