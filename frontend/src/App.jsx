import React, { useState, useEffect } from 'react';
import AppSidebar from './components/AppSidebar.jsx';
import AppHeader from './components/AppHeader.jsx';
import AppFooter from './components/AppFooter.jsx';
import { Toast } from './components/OverlayComponents.jsx';
import federationService from './services/federationService.js';
import studentService from './services/studentService.js';

// Pages
import DashboardPage from './pages/DashboardPage.jsx';
import ConsentVerificationPage from './pages/ConsentVerificationPage.jsx';
import ScholarshipResultsPage from './pages/ScholarshipResultsPage.jsx';
import FundingGapPage from './pages/FundingGapPage.jsx';
import StudentProfilePage from './pages/StudentProfilePage.jsx';
import FinancialProfilePage from './pages/FinancialProfilePage.jsx';
import ScholarshipDirectoryPage from './pages/ScholarshipDirectoryPage.jsx';
import ApplicationsAwardsPage from './pages/ApplicationsAwardsPage.jsx';
import QueryHistoryPage from './pages/QueryHistoryPage.jsx';
import StudentOrganizationDataPage from './pages/StudentOrganizationDataPage.jsx';
import DataManagementPage from './pages/DataManagementPage.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeQueryId, setActiveQueryId] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast helper
  function addToast({ type = 'info', title, message }) {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // Load initial students & health check
  async function loadInitialData() {
    try {
      const [health, studentList] = await Promise.all([
        federationService.getDbHealth().catch((err) => ({ success: false, message: err.message })),
        studentService.getAllStudents().catch(() => []),
      ]);
      setDbHealth(health);
      setStudents(studentList);

      if (studentList.length > 0 && !selectedStudent) {
        setSelectedStudent(studentList[0]);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    }
  }

  useEffect(() => {
    loadInitialData();

    // Read initial hash from URL if present
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveTab(hash);
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash) {
        setActiveTab(newHash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function handleNavigate(tabId) {
    setActiveTab(tabId);
    setSidebarOpen(false);
    window.location.hash = `#${tabId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className={`sl-app-layout ${sidebarCollapsed ? 'sl-layout-collapsed' : ''}`}>
      {/* Persistent Left Navigation Sidebar */}
      <AppSidebar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Pane to the right of Sidebar */}
      <div className="sl-app-main-pane">
        {/* Top Application Utility Bar */}
        <AppHeader
          activeTab={activeTab}
          onNavigate={handleNavigate}
          students={students}
          selectedStudent={selectedStudent}
          onSelectStudent={(st) => {
            setSelectedStudent(st);
            addToast({
              type: 'info',
              title: 'Context Switched',
              message: `Active student set to ${st.name} (${st.student_id}).`,
            });
          }}
          dbHealth={dbHealth}
          sidebarCollapsed={sidebarCollapsed}
          onToggleDesktopSidebar={() => setSidebarCollapsed((prev) => !prev)}
          onToggleMobileSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Main Content Area */}
        <main className="main-content">
        <div className="app-container">
          {activeTab === 'dashboard' && (
            <DashboardPage
              student={selectedStudent}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'consent' && (
            <ConsentVerificationPage
              student={selectedStudent}
              activeQueryId={activeQueryId}
              onSetActiveQueryId={setActiveQueryId}
              onNavigate={handleNavigate}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'results' && (
            <ScholarshipResultsPage
              student={selectedStudent}
              activeQueryId={activeQueryId}
              onNavigate={handleNavigate}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'funding-gap' && (
            <FundingGapPage
              student={selectedStudent}
              activeQueryId={activeQueryId}
              onNavigate={handleNavigate}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'student-profile' && (
            <StudentProfilePage
              student={selectedStudent}
              onSelectStudent={(st) => setSelectedStudent(st)}
              onRefreshStudents={loadInitialData}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'financial-profile' && (
            <FinancialProfilePage
              student={selectedStudent}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'scholarships' && (
            <ScholarshipDirectoryPage
              onShowToast={addToast}
            />
          )}

          {activeTab === 'applications-awards' && (
            <ApplicationsAwardsPage
              student={selectedStudent}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'queries' && (
            <QueryHistoryPage
              student={selectedStudent}
              onSetActiveQueryId={setActiveQueryId}
              onNavigate={handleNavigate}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'org-student-data' && (
            <StudentOrganizationDataPage
              student={selectedStudent}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'data-management' && (
            <DataManagementPage
              onNavigate={handleNavigate}
            />
          )}
        </div>
      </main>

        {/* Professional Dark-Navy Gradient 4-Column Footer */}
        <AppFooter onNavigate={handleNavigate} />
      </div>

      {/* Toast Notification Layer */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
