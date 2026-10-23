import React from 'react';

export default function AppSidebar({
  activeTab,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
  isOpen = false,
  onClose,
}) {
  const navSections = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'student-profile', label: 'Student Profile', icon: 'person' },
        { id: 'financial-profile', label: 'Financial Profile', icon: 'account_balance' },
      ],
    },
    {
      title: 'SCHOLARSHIP SERVICES',
      items: [
        { id: 'consent', label: 'Consent & OTP Verification', icon: 'verified_user' },
        { id: 'results', label: 'Scholarship Verification Results', icon: 'assessment' },
        { id: 'funding-gap', label: 'Funding Gap Details', icon: 'account_balance_wallet' },
      ],
    },
    {
      title: 'DATA MANAGEMENT',
      items: [
        { id: 'data-management', label: 'Data Management Hub', icon: 'tune' },
        { id: 'student-profile', label: 'Students', icon: 'people' },
        { id: 'scholarships', label: 'Organizations & Programmes', icon: 'school' },
        { id: 'applications-awards', label: 'Applications & Awards', icon: 'workspace_premium' },
        { id: 'queries', label: 'Query History', icon: 'history' },
        { id: 'org-student-data', label: 'Foundation Records Bridge', icon: 'corporate_fare' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="sl-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Persistent Sidebar */}
      <aside
        className={`sl-sidebar ${isCollapsed ? 'sl-sidebar-collapsed' : ''} ${isOpen ? 'sl-sidebar-open' : ''}`}
        aria-label="Application Sidebar Navigation"
      >
        {/* Brand Container */}
        <div className="sl-sidebar-header">
          <div
            className="sl-sidebar-brand"
            onClick={() => {
              onNavigate('dashboard');
              onClose?.();
            }}
            role="button"
            tabIndex={0}
            title="ScholarLink Dashboard"
          >
            <div className="sl-sidebar-brand-icon">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <div className="sl-sidebar-brand-text">
              <span className="sl-sidebar-brand-name">ScholarLink</span>
              <span className="sl-sidebar-brand-subtitle">Information Exchange</span>
            </div>
          </div>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            className="sl-sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="material-symbols-outlined">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            className="sl-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation sidebar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Content (Scrollable) */}
        <nav className="sl-sidebar-nav-container">
          {navSections.map((section) => (
            <div key={section.title} className="sl-sidebar-section">
              <div className="sl-sidebar-section-header">
                <span className="sl-sidebar-section-title">{section.title}</span>
                <span className="sl-sidebar-section-divider" />
              </div>

              <div className="sl-sidebar-nav-list">
                {section.items.map((item, idx) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={`${section.title}-${item.id}-${idx}`}
                      type="button"
                      className={`sl-sidebar-nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose?.();
                      }}
                      title={isCollapsed ? item.label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="material-symbols-outlined sl-sidebar-nav-icon">
                        {item.icon}
                      </span>
                      <span className="sl-sidebar-nav-label">
                        {item.label}
                      </span>
                      {isActive && <span className="sl-sidebar-active-indicator" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer Notice */}
        <div className="sl-sidebar-footer">
          <div className="sl-sidebar-status-box" title="Consortium Clearinghouse Online • Academic DBMS Prototype">
            <span className="sl-sidebar-status-dot" />
            <div className="sl-sidebar-status-text">
              <span className="sl-sidebar-status-title">Consortium Online</span>
              <span className="sl-sidebar-status-sub">Academic DBMS Prototype</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
