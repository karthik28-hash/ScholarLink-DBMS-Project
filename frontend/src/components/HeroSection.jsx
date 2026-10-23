import React from 'react';
import CurrencyValue, { formatINR } from './CurrencyValue.jsx';

export default function HeroSection({
  student,
  totalCost = 100000,
  assistance = 50000,
  fundingGap = 50000,
  onExploreFunding,
  onVerifyScholarships,
}) {
  const studentName = student?.name || 'Rahul Sharma';
  const studentId = student?.student_id || 'STU1001';
  const courseName = student?.course_name || 'Computer Science and Engineering';
  const collegeName = student?.college_name || 'ABC Engineering College';

  const assistancePct = totalCost > 0 ? Math.round((assistance / totalCost) * 100) : 50;
  const gapPct = Math.max(0, 100 - assistancePct);

  return (
    <section className="sl-hero-container">
      {/* Subtle background ambient lighting */}
      <div className="sl-hero-glow-1" />
      <div className="sl-hero-glow-2" />

      <div className="sl-hero-grid">
        {/* Left Column: Narrative & Action Calls */}
        <div className="sl-hero-content">
          <div className="sl-hero-badge">
            <span className="sl-hero-badge-dot" />
            <span>Institutional Exchange • Academic Prototype</span>
          </div>

          <h1 className="sl-hero-title">
            Your education.{' '}
            <em className="sl-hero-title-italic">Your opportunities.</em>
          </h1>

          <p className="sl-hero-description">
            ScholarLink unifies student academic expenses, consent-based scholarship verification across three independent foundation registries, and accurate funding-gap reconciliation into a single sovereign financial clearinghouse.
          </p>

          <div className="sl-hero-actions">
            <button
              type="button"
              className="sl-btn sl-btn-hero-primary"
              onClick={onExploreFunding}
            >
              <span>Explore Your Funding</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_downward
              </span>
            </button>

            <button
              type="button"
              className="sl-btn sl-btn-hero-secondary"
              onClick={onVerifyScholarships}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                verified_user
              </span>
              <span>Verify Scholarships</span>
            </button>
          </div>

          {/* Micro trust indicators */}
          <div className="sl-hero-meta">
            <div className="sl-hero-meta-item">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
              <span>Purpose-Bound Consent</span>
            </div>
            <span className="sl-hero-meta-divider">•</span>
            <div className="sl-hero-meta-item">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>hub</span>
              <span>Tripartite Foundation Query</span>
            </div>
            <span className="sl-hero-meta-divider">•</span>
            <div className="sl-hero-meta-item">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>account_balance</span>
              <span>Zero Banking Exposure</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Financial & Tri-Party Composition */}
        <div className="sl-hero-visual">
          <div className="sl-hero-card">
            {/* Header with active student indicator */}
            <div className="sl-hero-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="sl-hero-avatar">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    school
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.2 }}>
                    {studentName}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255, 255, 255, 0.65)' }}>
                    {studentId} • {collegeName}
                  </div>
                </div>
              </div>

              <span className="sl-hero-tag">
                Live Ledger
              </span>
            </div>

            {/* Financial Numbers Highlight */}
            <div className="sl-hero-stat-block">
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                Total Assessed Obligation
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, color: '#FFFFFF' }}>
                  {formatINR(totalCost)}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  INR / AY 2026–27
                </span>
              </div>
            </div>

            {/* Visual Multi-Segment Equilibrium Bar */}
            <div style={{ margin: '14px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                <span style={{ color: '#92F2D4', fontWeight: 600 }}>Recorded: {formatINR(assistance)} ({assistancePct}%)</span>
                <span style={{ color: '#FFB4AC', fontWeight: 600 }}>Gap: {formatINR(fundingGap)} ({gapPct}%)</span>
              </div>
              <div className="sl-hero-progress-track">
                <div
                  className="sl-hero-progress-fill-assistance"
                  style={{ width: `${assistancePct}%` }}
                />
                <div
                  className="sl-hero-progress-fill-gap"
                  style={{ width: `${gapPct}%` }}
                />
              </div>
            </div>

            {/* Tri-Party Organization Nodes Diagram */}
            <div className="sl-hero-orgs-container">
              <div className="sl-hero-orgs-title">
                Connected Independent Foundations
              </div>

              <div className="sl-hero-orgs-grid">
                <div className="sl-hero-org-pill">
                  <div className="sl-hero-org-dot" style={{ backgroundColor: '#92F2D4' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '12px' }}>SBI Foundation</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'var(--font-mono)' }}>ORG001 • ₹25,000</div>
                  </div>
                </div>

                <div className="sl-hero-org-pill">
                  <div className="sl-hero-org-dot" style={{ backgroundColor: '#92F2D4' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '12px' }}>Tata Capital</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'var(--font-mono)' }}>ORG002 • ₹15,000</div>
                  </div>
                </div>

                <div className="sl-hero-org-pill">
                  <div className="sl-hero-org-dot" style={{ backgroundColor: '#92F2D4' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '12px' }}>Reliance Foundation</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'var(--font-mono)' }}>ORG003 • ₹10,000</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer stamp inside card */}
            <div className="sl-hero-card-footer">
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#92F2D4' }}>
                verified
              </span>
              <span>Federated Registry Consensus • Zero Discrepancies</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
