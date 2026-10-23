import React, { useState, useEffect } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import { LoadingState } from '../components/FeedbackStates.jsx';
import studentService from '../services/studentService.js';
import organizationService from '../services/organizationService.js';
import queryService from '../services/queryService.js';

export default function DataManagementPage({ onNavigate }) {
  const [stats, setStats] = useState({
    studentsCount: 0,
    organizationsCount: 0,
    queriesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [students, orgs, queries] = await Promise.all([
          studentService.getAllStudents(),
          organizationService.getAllOrganizations(),
          queryService.getAllQueries(),
        ]);
        setStats({
          studentsCount: students.length,
          organizationsCount: orgs.length,
          queriesCount: queries.length,
        });
      } catch (err) {
        console.error('Failed to load management stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const sections = [
    {
      id: 'student-profile',
      title: 'Students Registry',
      icon: 'people',
      count: stats.studentsCount,
      countLabel: 'Students',
      description: 'Manage student records, enrolled degree programs, college affiliations, and institutional IDs.',
      color: 'var(--primary-action)',
    },
    {
      id: 'financial-profile',
      title: 'Financial Profiles',
      icon: 'account_balance',
      count: 'Active',
      countLabel: 'Submissions',
      description: 'Review and update family income profiles, family size dependents, and reported education living expenses.',
      color: 'var(--status-verified)',
    },
    {
      id: 'scholarships',
      title: 'Scholarship Programs Directory',
      icon: 'school',
      count: stats.organizationsCount,
      countLabel: 'Foundations',
      description: 'Catalog partner organizations and configure need-based or merit-based scholarship award ceilings.',
      color: 'var(--status-pending)',
    },
    {
      id: 'applications-awards',
      title: 'Applications & Awards',
      icon: 'workspace_premium',
      count: 'Consortium',
      countLabel: 'Records',
      description: 'Create and inspect student scholarship applications and certified grant disbursement awards.',
      color: 'var(--primary-action)',
    },
    {
      id: 'queries',
      title: 'Query & Consent Audit Logs',
      icon: 'history',
      count: stats.queriesCount,
      countLabel: 'Transactions',
      description: 'Audit log of all federated query requests, purpose specifications, consent timestamps, and execution statuses.',
      color: 'var(--text-primary)',
    },
    {
      id: 'org-student-data',
      title: 'Organization Specific Views',
      icon: 'corporate_fare',
      count: '3 Nodes',
      countLabel: 'Bridge',
      description: 'Directly view a student\'s individual scholarship records and aggregated award summary from a specific foundation API.',
      color: 'var(--status-verified)',
    },
  ];

  return (
    <div className="flex-col gap-lg">
      <PageHeading
        contextBadge="Central Administrative Hub"
        subBadge="Database Records Management"
        titleRegular="Consolidated"
        titleItalic="data management."
        description="Comprehensive management portal exposing the ScholarLink DBMS database tables, foundation catalogs, and audit logs for academic inspection and demonstration."
      />

      {loading && <LoadingState message="Aggregating database statistics..." />}

      {!loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '28px',
          }}
        >
          {sections.map((sec) => (
            <div
              key={sec.id}
              className="sl-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--surface-neutral)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: sec.color,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                      {sec.icon}
                    </span>
                  </div>
                  <span className="sl-mono-chip" style={{ fontWeight: 600 }}>
                    {sec.count} {sec.countLabel}
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {sec.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                  {sec.description}
                </p>
              </div>

              <button
                type="button"
                className="sl-btn sl-btn-secondary sl-btn-sm"
                onClick={() => onNavigate(sec.id)}
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>Manage {sec.title}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Honest Scope & Architecture Note */}
      <section className="sl-card-neutral" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--primary-action)', fontSize: '22px', marginTop: '2px' }}>
          storage
        </span>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong>Prototype Architecture Notice:</strong> This section provides direct management access to the underlying MySQL database tables across the central database (`scholarlink_central`) and the three independent foundation instances (`scholarlink_sbi_foundation`, `scholarlink_tata_capital`, `scholarlink_reliance_foundation`). No artificial access-control or simulated permission gates have been introduced.
        </div>
      </section>
    </div>
  );
}
