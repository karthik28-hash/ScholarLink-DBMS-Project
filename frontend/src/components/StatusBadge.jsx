import React from 'react';

export default function StatusBadge({ status, label, className = '' }) {
  let badgeClass = 'sl-badge-neutral';
  let displayLabel = label || status || 'Unknown';

  const normalized = String(status || '').toUpperCase();

  if (
    normalized === 'VERIFIED' ||
    normalized === 'APPROVED' ||
    normalized === 'COMPLETED' ||
    normalized === 'LOOKUP_COMPLETED' ||
    normalized === 'FULLY_COVERED' ||
    normalized === 'ASSISTANCE_EXCEEDS_COST'
  ) {
    badgeClass = 'sl-badge-verified';
    if (!label) {
      if (normalized === 'FULLY_COVERED') displayLabel = 'Fully Covered';
      else if (normalized === 'ASSISTANCE_EXCEEDS_COST') displayLabel = 'Assistance Exceeds Cost';
      else if (normalized === 'LOOKUP_COMPLETED') displayLabel = 'Lookup Complete';
      else displayLabel = normalized;
    }
  } else if (
    normalized === 'PENDING' ||
    normalized === 'CONSENT_REQUESTED' ||
    normalized === 'LOOKUP_PARTIAL' ||
    normalized === 'IN_PROGRESS' ||
    normalized === 'AWAITING_INPUT'
  ) {
    badgeClass = 'sl-badge-pending';
    if (!label) {
      if (normalized === 'CONSENT_REQUESTED') displayLabel = 'Consent Requested';
      else if (normalized === 'LOOKUP_PARTIAL') displayLabel = 'Partial Response';
      else displayLabel = normalized;
    }
  } else if (
    normalized === 'FUNDING_GAP_REMAINS' ||
    normalized === 'FAILED' ||
    normalized === 'LOOKUP_FAILED' ||
    normalized === 'DENIED' ||
    normalized === 'CONSENT_DENIED' ||
    normalized === 'REJECTED' ||
    normalized === 'EXPIRED'
  ) {
    badgeClass = 'sl-badge-gap';
    if (!label) {
      if (normalized === 'FUNDING_GAP_REMAINS') displayLabel = 'Funding Gap Remains';
      else if (normalized === 'CONSENT_DENIED') displayLabel = 'Consent Denied';
      else if (normalized === 'LOOKUP_FAILED') displayLabel = 'Lookup Failed';
      else displayLabel = normalized;
    }
  } else if (
    normalized === 'CONSENT_GRANTED' ||
    normalized === 'SUBMITTED' ||
    normalized === 'ACTIVE'
  ) {
    badgeClass = 'sl-badge-primary';
    if (!label) {
      if (normalized === 'CONSENT_GRANTED') displayLabel = 'Consent Verified';
      else displayLabel = normalized;
    }
  }

  return (
    <span className={`sl-badge ${badgeClass} ${className}`}>
      <span className="sl-badge-dot" />
      <span>{displayLabel}</span>
    </span>
  );
}
