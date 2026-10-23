import React from 'react';

export default function AppFooter({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="sl-footer">
      <div className="sl-footer-container">
        {/* Four Balanced Columns Grid */}
        <div className="sl-footer-grid">
          {/* Column 1 — ScholarLink */}
          <div className="sl-footer-col sl-footer-col-brand">
            <div
              className="sl-footer-brand"
              onClick={() => onNavigate('dashboard')}
              role="button"
              tabIndex={0}
              title="ScholarLink"
            >
              <div className="sl-footer-brand-icon">
                <span className="material-symbols-outlined">account_balance</span>
              </div>
              <span className="sl-footer-brand-title">ScholarLink</span>
            </div>

            <p className="sl-footer-description">
              ScholarLink is a federated scholarship information exchange system connecting students, academic institutions, and independent foundation databases.
            </p>

            <p className="sl-footer-statement">
              Designed for transparent, consent-based information verification without exposing private family banking records.
            </p>
          </div>

          {/* Column 2 — Explore */}
          <div className="sl-footer-col">
            <h4 className="sl-footer-col-title">Explore</h4>
            <ul className="sl-footer-nav-list">
              <li>
                <button
                  type="button"
                  className="sl-footer-nav-link"
                  onClick={() => onNavigate('dashboard')}
                >
                  Student Funding Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="sl-footer-nav-link"
                  onClick={() => onNavigate('student-profile')}
                >
                  Student Profile
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="sl-footer-nav-link"
                  onClick={() => onNavigate('financial-profile')}
                >
                  Financial Profile
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="sl-footer-nav-link"
                  onClick={() => onNavigate('funding-gap')}
                >
                  Funding Gap Details
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3 — Scholarship Services */}
          <div className="sl-footer-col">
            <h4 className="sl-footer-col-title">Scholarship Services</h4>
            <ul className="sl-footer-nav-list">
              <li>
                <button
                  type="button"
                  className="sl-footer-nav-link"
                  onClick={() => onNavigate('consent')}
                >
                  Consent & OTP Verification
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="sl-footer-nav-link"
                  onClick={() => onNavigate('results')}
                >
                  Scholarship Verification Results
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="sl-footer-nav-link"
                  onClick={() => onNavigate('scholarships')}
                >
                  Scholarship Programmes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="sl-footer-nav-link"
                  onClick={() => onNavigate('queries')}
                >
                  Query History
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4 — Participating Organizations */}
          <div className="sl-footer-col">
            <h4 className="sl-footer-col-title">Participating Organizations</h4>
            <div className="sl-footer-org-list">
              <div className="sl-footer-org-row">
                <span className="sl-footer-org-bullet" />
                <div className="sl-footer-org-details">
                  <div className="sl-footer-org-name">SBI Foundation</div>
                  <div className="sl-footer-org-desc">Higher Education & Need Support</div>
                </div>
              </div>

              <div className="sl-footer-org-row">
                <span className="sl-footer-org-bullet" />
                <div className="sl-footer-org-details">
                  <div className="sl-footer-org-name">Tata Capital</div>
                  <div className="sl-footer-org-desc">Pankh Scholarship Programme</div>
                </div>
              </div>

              <div className="sl-footer-org-row">
                <span className="sl-footer-org-bullet" />
                <div className="sl-footer-org-details">
                  <div className="sl-footer-org-name">Reliance Foundation</div>
                  <div className="sl-footer-org-desc">Undergraduate STEM Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider Rule */}
        <div className="sl-footer-divider" />

        {/* Bottom Footer Strip */}
        <div className="sl-footer-bottom-strip">
          <div className="sl-footer-bottom-left">
            <div className="sl-footer-copyright">
              © {currentYear} ScholarLink — Scholarship Information Exchange System. Academic DBMS Project.
            </div>
            <div className="sl-footer-disclaimer">
              <strong>Academic Prototype Notice:</strong> Funding estimates depend strictly on recorded educational fee schedules and successfully retrieved foundation assistance records. ScholarLink informs; it does not make official scholarship eligibility, admission, or disbursement decisions.
            </div>
          </div>

          {/* Compact Back to Dashboard Button (Fixed Content Width) */}
          <div className="sl-footer-bottom-right">
            <button
              type="button"
              className="sl-footer-back-btn"
              onClick={() => {
                onNavigate('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="Back to dashboard top"
            >
              <span>Back to Dashboard</span>
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
