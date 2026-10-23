import React, { useState, useEffect } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LoadingState, ErrorState } from '../components/FeedbackStates.jsx';
import queryService from '../services/queryService.js';
import consentService from '../services/consentService.js';
import organizationService from '../services/organizationService.js';

export default function ConsentVerificationPage({
  student,
  activeQueryId,
  onSetActiveQueryId,
  onNavigate,
  onShowToast,
}) {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgIds, setSelectedOrgIds] = useState(['ORG001', 'ORG002', 'ORG003']);
  const [purpose, setPurpose] = useState('Consolidated Academic Year 2026-27 Scholarship Disbursement Coordination and Need Verification');
  
  // Workflow state
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(null);
  const [consent, setConsent] = useState(null);
  const [otpValue, setOtpValue] = useState('');
  const [receivedOtpCode, setReceivedOtpCode] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const studentId = student?.student_id || 'STU1001';

  // Load organizations on mount
  useEffect(() => {
    async function loadOrgs() {
      try {
        const orgs = await organizationService.getAllOrganizations();
        setOrganizations(orgs);
      } catch (err) {
        console.error('Failed to load organizations:', err);
      }
    }
    loadOrgs();
  }, []);

  // If activeQueryId is provided, load its existing details
  useEffect(() => {
    if (activeQueryId) {
      loadExistingQuery(activeQueryId);
    }
  }, [activeQueryId]);

  async function loadExistingQuery(qId) {
    try {
      setLoading(true);
      const q = await queryService.getQueryById(qId);
      setQuery(q);
      const c = await consentService.getConsent(qId);
      setConsent(c);
      if (c?.otp_code) {
        setReceivedOtpCode(c.otp_code);
      }
    } catch (err) {
      console.error('Failed to load query details:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Organization checkbox toggle
  function toggleOrg(orgId) {
    if (selectedOrgIds.includes(orgId)) {
      if (selectedOrgIds.length === 1) {
        onShowToast?.({ type: 'error', message: 'At least one target organization must be selected.' });
        return;
      }
      setSelectedOrgIds(selectedOrgIds.filter((id) => id !== orgId));
    } else {
      setSelectedOrgIds([...selectedOrgIds, orgId]);
    }
  }

  // Step 1: Create Query and Request Consent
  async function handleCreateQueryAndRequestConsent() {
    try {
      setSubmitting(true);
      setStatusMessage(null);

      // 1. Create Query in central DB
      const queryRes = await queryService.createQuery({
        studentId,
        organizationIds: selectedOrgIds,
        purpose,
      });

      const newQueryId = queryRes.query_id || queryRes.queryId;
      setQuery(queryRes);
      onSetActiveQueryId?.(newQueryId);

      // 2. Request Consent (generates OTP in prototype)
      const consentRes = await consentService.requestConsent(newQueryId);
      setConsent(consentRes);
      
      if (consentRes.otpCode) {
        setReceivedOtpCode(consentRes.otpCode);
        // Pre-fill helper or display clearly
        onShowToast?.({
          type: 'info',
          title: 'OTP Dispatched (Prototype)',
          message: `Verification code generated: ${consentRes.otpCode}`,
        });
      }

      setStatusMessage({
        type: 'success',
        text: `Query #${newQueryId} registered. Please enter the 6-digit OTP code below to verify your student consent.`,
      });
    } catch (err) {
      console.error('Consent request failed:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to initiate consent request.',
      });
      onShowToast?.({ type: 'error', message: err.message || 'Consent request failed' });
    } finally {
      setSubmitting(false);
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp(codeToSubmit) {
    const code = codeToSubmit || otpValue;
    if (!code || code.length !== 6) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid 6-digit OTP code.',
      });
      return;
    }

    const currentQueryId = query?.query_id || query?.queryId || activeQueryId;
    if (!currentQueryId) {
      setStatusMessage({
        type: 'error',
        text: 'No active query found. Please initiate a consent query first.',
      });
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage(null);

      const res = await consentService.verifyConsent(currentQueryId, code);
      setConsent((prev) => ({ ...prev, ...res, otp_status: 'VERIFIED' }));
      setQuery((prev) => ({ ...prev, status: 'CONSENT_GRANTED' }));

      setStatusMessage({
        type: 'success',
        text: 'Consent successfully verified! You may now proceed to run the federated scholarship lookup.',
      });

      onShowToast?.({
        type: 'success',
        title: 'Consent Verified',
        message: 'Your consent token is active. Proceeding to federated lookup.',
      });
    } catch (err) {
      console.error('OTP verification failed:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'OTP verification failed. Please check the code and try again.',
      });
      onShowToast?.({ type: 'error', message: err.message || 'Invalid OTP' });
    } finally {
      setSubmitting(false);
    }
  }

  // Optional: Deny Consent
  async function handleDenyConsent() {
    const currentQueryId = query?.query_id || query?.queryId || activeQueryId;
    if (!currentQueryId) return;

    try {
      setSubmitting(true);
      const res = await consentService.denyConsent(currentQueryId);
      setConsent((prev) => ({ ...prev, ...res, otp_status: 'DENIED' }));
      setQuery((prev) => ({ ...prev, status: 'CONSENT_DENIED' }));

      setStatusMessage({
        type: 'error',
        text: 'Consent has been explicitly denied. No scholarship records will be retrieved.',
      });

      onShowToast?.({
        type: 'info',
        title: 'Consent Denied',
        message: 'Consent request marked as denied.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to deny consent.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleOtpChange(e) {
    const rawVal = e.target.value;
    const numericOnly = rawVal.replace(/\D/g, '').slice(0, 6);
    setOtpValue(numericOnly);
  }

  function handleAutoFillTestOtp() {
    if (receivedOtpCode) {
      const clean = String(receivedOtpCode).replace(/\D/g, '').slice(0, 6);
      setOtpValue(clean);
    }
  }

  const isVerified =
    consent?.otp_status === 'VERIFIED' ||
    consent?.otpStatus === 'VERIFIED' ||
    query?.status === 'CONSENT_GRANTED';

  const isDenied =
    consent?.otp_status === 'DENIED' ||
    consent?.otpStatus === 'DENIED' ||
    query?.status === 'CONSENT_DENIED';

  const isPending =
    (consent?.otp_status === 'PENDING' || consent?.otpStatus === 'PENDING') &&
    !isVerified &&
    !isDenied;

  const currentQueryId = query?.query_id || query?.queryId || activeQueryId;

  return (
    <div className="flex-col gap-lg">
      <PageHeading
        contextBadge="Consent Management Protocol"
        subBadge={currentQueryId ? `Query ID #${currentQueryId}` : 'New Verification Query'}
        titleRegular="Authorize secure"
        titleItalic="scholarship verification."
        description="Your explicit consent enables ScholarLink to query verified grant registries across SBI Foundation, Tata Capital, and Reliance Foundation without exposing private banking records."
      />

      {statusMessage && (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: statusMessage.type === 'success' ? 'var(--status-verified-bg)' : 'var(--status-gap-bg)',
            border: `1px solid ${statusMessage.type === 'success' ? 'var(--status-verified-border)' : 'var(--status-gap-border)'}`,
            color: statusMessage.type === 'success' ? 'var(--status-verified)' : 'var(--status-gap)',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {statusMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span style={{ flex: 1 }}>{statusMessage.text}</span>
        </div>
      )}

      {/* Two-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Scope & Consent Form */}
        <div className="sl-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--status-verified)', fontSize: '22px' }}>
                verified_user
              </span>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Consent Scope & Target Selection
              </h2>
            </div>
            {currentQueryId && (
              <span className="sl-mono-chip" style={{ fontSize: '11px' }}>
                Query #{currentQueryId}
              </span>
            )}
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Specify the institutional inquiry purpose and select the scholarship organizations to be contacted for federated registry lookup.
          </p>

          {/* Student Context Card */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-neutral)',
              border: '1px solid var(--border-hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div className="sl-label">Authorizing Student</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {student?.name || 'Selected Student'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                ID: {studentId} • {student?.course_name || 'Program'}
              </div>
            </div>
            <StatusBadge
              status={isVerified ? 'VERIFIED' : isDenied ? 'DENIED' : isPending ? 'PENDING' : 'READY'}
              label={isVerified ? 'Consented' : isDenied ? 'Denied' : isPending ? 'Awaiting OTP' : 'Draft'}
            />
          </div>

          {/* Organization Selection Checkboxes */}
          <div>
            <label className="sl-label" style={{ display: 'block', marginBottom: '8px' }}>
              Participating Organization Targets
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {organizations.map((org) => {
                const isSelected = selectedOrgIds.includes(org.organization_id);
                return (
                  <label
                    key={org.organization_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'var(--surface-pale-blue)' : 'var(--surface-neutral)',
                      border: `1px solid ${isSelected ? 'rgba(54, 89, 217, 0.3)' : 'var(--border-hairline)'}`,
                      cursor: isVerified ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !isVerified && toggleOrg(org.organization_id)}
                        disabled={isVerified || submitting}
                        style={{ accentColor: 'var(--primary-action)', width: '16px', height: '16px' }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {org.organization_name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {org.organization_type}
                        </div>
                      </div>
                    </div>
                    <span className="sl-mono-chip" style={{ fontSize: '10px' }}>
                      {org.organization_id}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Purpose Input */}
          <div className="sl-input-group">
            <label className="sl-label" htmlFor="purpose-input">
              Lookup Purpose Specification
            </label>
            <textarea
              id="purpose-input"
              className="sl-textarea"
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              disabled={isVerified || submitting}
              placeholder="State the academic purpose for this federated query..."
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Initiation Button */}
          {!currentQueryId || isDenied ? (
            <button
              type="button"
              className="sl-btn sl-btn-primary"
              onClick={handleCreateQueryAndRequestConsent}
              disabled={submitting || selectedOrgIds.length === 0}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                send
              </span>
              <span>{submitting ? 'Creating Query...' : 'Create Query & Request Consent'}</span>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="sl-btn sl-btn-secondary sl-btn-sm"
                onClick={handleCreateQueryAndRequestConsent}
                disabled={submitting}
              >
                <span>Create New Query Instead</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: OTP Input & Verification Controls */}
        <div className="sl-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface-pale-blue)',
                  color: 'var(--primary-action)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  mark_email_read
                </span>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                OTP Clearance Verification
              </h2>
            </div>
            <StatusBadge
              status={isVerified ? 'VERIFIED' : isDenied ? 'DENIED' : isPending ? 'PENDING' : 'IDLE'}
              label={isVerified ? 'Verified' : isDenied ? 'Denied' : isPending ? 'Awaiting OTP' : 'Idle'}
            />
          </div>

          {/* Honest Prototype Notice Callout */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-neutral)',
              border: '1px solid var(--border-hairline)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary-action)' }}>info</span>
              <span>Academic Prototype Authentication Mechanism</span>
            </div>
            This is an academic prototype demonstration. The OTP is generated by the local Express backend on consent request and passed directly in the API response for testing. No third-party SMS or telecommunications gateway is involved.
          </div>

          {/* Dispatched OTP Display for Testing */}
          {receivedOtpCode && (
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-pale-blue)',
                border: '1px solid rgba(54, 89, 217, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span className="sl-label" style={{ color: 'var(--primary-action)' }}>
                  Generated Prototype Test Code
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em' }}>
                  {receivedOtpCode}
                </div>
              </div>
              <button
                type="button"
                className="sl-btn sl-btn-secondary sl-btn-sm"
                onClick={handleAutoFillTestOtp}
                style={{ fontSize: '11px' }}
              >
                Auto-Fill Code
              </button>
            </div>
          )}

          {/* Single 6-Digit OTP Input Field */}
          <div className="sl-otp-container">
            <label className="sl-otp-label" htmlFor="otp-single-input">
              Enter 6-digit verification code
            </label>
            <input
              id="otp-single-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={otpValue}
              onChange={handleOtpChange}
              disabled={isVerified || submitting || !currentQueryId}
              placeholder="••••••"
              className="sl-otp-single-input"
              autoFocus={Boolean(currentQueryId) && !isVerified}
            />
          </div>

          {/* Action Buttons */}
          {!isVerified ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="sl-btn sl-btn-primary"
                onClick={() => handleVerifyOtp()}
                disabled={submitting || !currentQueryId || otpValue.length !== 6}
                style={{ width: '100%' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  check
                </span>
                <span>{submitting ? 'Verifying Code...' : 'Affirm Consent & Verify OTP'}</span>
              </button>

                {currentQueryId && !isDenied && (
                  <button
                    type="button"
                    className="sl-btn sl-btn-ghost sl-btn-sm"
                    onClick={handleDenyConsent}
                    disabled={submitting}
                    style={{ color: 'var(--status-gap)' }}
                  >
                    <span>Deny Consent</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--status-verified-bg)',
                  border: '1px solid var(--status-verified-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-verified)', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>verified</span>
                  <span>Consent Verified & Cryptographically Bound</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Verification token confirmed. You can now execute the federated lookup across the 3 independent foundation databases.
                </p>
                <button
                  type="button"
                  className="sl-btn sl-btn-primary"
                  onClick={() => onNavigate('results')}
                  style={{ width: '100%' }}
                >
                  <span>Proceed to Federated Scholarship Lookup</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
