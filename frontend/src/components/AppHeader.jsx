import React, { useState, useRef, useEffect } from 'react';

export default function AppHeader({
  activeTab,
  onNavigate,
  students = [],
  selectedStudent,
  onSelectStudent,
  dbHealth,
  sidebarCollapsed = false,
  onToggleDesktopSidebar,
  onToggleMobileSidebar,
}) {
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const tabLabels = {
    dashboard: 'Student Funding Overview',
    consent: 'Consent & OTP Verification',
    results: 'Scholarship Verification Results',
    'funding-gap': 'Funding Gap Details',
    'student-profile': 'Student Profile',
    'financial-profile': 'Financial Profile',
    scholarships: 'Scholarship Directory',
    'applications-awards': 'Applications & Awards',
    queries: 'Query History Log',
    'org-student-data': 'Organization Records Bridge',
    'data-management': 'Data Management Hub',
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setStudentDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sl-top-bar">
      <div className="sl-top-bar-inner">
        {/* Left Side: Mobile Drawer Toggle + Desktop Collapse Toggle + Breadcrumb */}
        <div className="sl-top-bar-left">
          {/* Mobile drawer toggle */}
          <button
            type="button"
            className="sl-sidebar-mobile-toggle"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle navigation drawer"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Desktop sidebar collapse toggle */}
          <button
            type="button"
            className="sl-sidebar-desktop-toggle"
            onClick={onToggleDesktopSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!sidebarCollapsed}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="material-symbols-outlined">
              {sidebarCollapsed ? 'menu_open' : 'menu'}
            </span>
          </button>

          {/* Mobile brand (visible only on small mobile viewports) */}
          <div
            className="sl-mobile-brand"
            onClick={() => onNavigate('dashboard')}
            role="button"
            tabIndex={0}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary-action)' }}>
              account_balance
            </span>
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
              ScholarLink
            </span>
          </div>

          {/* Desktop breadcrumb */}
          <nav className="sl-top-bar-breadcrumb" aria-label="Breadcrumb">
            <span className="sl-breadcrumb-root">Portal</span>
            <span className="sl-breadcrumb-sep">/</span>
            <span className="sl-breadcrumb-current">
              {tabLabels[activeTab] || 'Dashboard'}
            </span>
          </nav>
        </div>

        {/* Right Side: Database Connection Badge & Student Profile Control */}
        <div className="sl-top-bar-right">
          {/* DB Health indicator */}
          <div
            title={dbHealth?.success ? 'Consortium DB Cluster Online (Central + 3 Foundations)' : 'Database connection error'}
            className="sl-db-status-badge"
            style={{
              backgroundColor: dbHealth?.success ? 'var(--status-verified-bg)' : 'var(--status-gap-bg)',
              borderColor: dbHealth?.success ? 'var(--status-verified-border)' : 'var(--status-gap-border)',
              color: dbHealth?.success ? 'var(--status-verified)' : 'var(--status-gap)',
            }}
          >
            <span
              className="sl-db-status-dot"
              style={{
                backgroundColor: dbHealth?.success ? 'var(--status-verified)' : 'var(--status-gap)',
              }}
            />
            <span className="sl-db-status-text">
              {dbHealth?.success ? 'DB Cluster Online' : 'DB Error'}
            </span>
          </div>

          {/* Student Profile Control */}
          <div className="sl-student-profile-control" ref={dropdownRef}>
            <button
              type="button"
              className={`sl-student-profile-btn ${studentDropdownOpen ? 'sl-student-profile-btn-active' : ''}`}
              onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
              aria-haspopup="true"
              aria-expanded={studentDropdownOpen}
              aria-label={`Student context: ${selectedStudent?.name || 'Rahul Sharma'}`}
            >
              {/* Avatar with fixed size */}
              <div className="sl-student-profile-avatar">
                <span className="material-symbols-outlined">person</span>
              </div>

              {/* Student text lines (Name on line 1, ID on line 2) */}
              <div className="sl-student-profile-text">
                <span className="sl-student-profile-name" title={selectedStudent?.name || 'Select Student'}>
                  {selectedStudent?.name || 'Select Student'}
                </span>
                <span className="sl-student-profile-id">
                  {selectedStudent?.student_id || 'STU1001'}
                </span>
              </div>

              {/* Dropdown caret at far right */}
              <span className="material-symbols-outlined sl-student-profile-caret">
                {studentDropdownOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Context Switcher Dropdown */}
            {studentDropdownOpen && (
              <div className="sl-student-profile-dropdown" role="menu">
                <div className="sl-student-dropdown-title">
                  Switch Active Student Record
                </div>
                <div className="sl-student-dropdown-list">
                  {students.map((st) => {
                    const isCur = selectedStudent?.student_id === st.student_id;
                    return (
                      <button
                        key={st.student_id}
                        type="button"
                        className={`sl-student-dropdown-row ${isCur ? 'active' : ''}`}
                        onClick={() => {
                          onSelectStudent(st);
                          setStudentDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        <div className="sl-dropdown-avatar">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="sl-dropdown-student-details">
                          <div className="sl-dropdown-student-name">{st.name}</div>
                          <div className="sl-dropdown-student-course">{st.course_name}</div>
                        </div>
                        <span className="sl-mono-chip">{st.student_id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
