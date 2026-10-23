import React from 'react';

export function LoadingState({ message = 'Loading institutional data...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center',
        gap: '16px',
        color: 'var(--text-secondary)',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid var(--border-hairline)',
          borderTopColor: 'var(--primary-action)',
          borderRadius: '50%',
          animation: 'sl-spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes sl-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ fontFamily: 'var(--font-interface)', fontSize: '14px', fontWeight: 500 }}>
        {message}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
        Querying ScholarLink Central Clearinghouse
      </div>
    </div>
  );
}

export function EmptyState({
  title = 'No records found',
  description = 'There are no records matching your current selection.',
  icon = 'inbox',
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px 24px',
        textAlign: 'center',
        gap: '12px',
        border: '1px dashed var(--border-hairline)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--surface-neutral)',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--surface-white)',
          border: '1px solid var(--border-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
          {icon}
        </span>
      </div>
      <h4 style={{ fontFamily: 'var(--font-interface)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
        {title}
      </h4>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="sl-btn sl-btn-secondary sl-btn-sm"
          onClick={onAction}
          style={{ marginTop: '8px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Unable to complete request',
  message = 'An unexpected server error occurred.',
  onRetry,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        gap: '12px',
        border: '1px solid var(--status-gap-border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--status-gap-bg)',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--status-gap-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--status-gap)',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
          warning
        </span>
      </div>
      <h4 style={{ fontFamily: 'var(--font-interface)', fontSize: '15px', fontWeight: 600, color: 'var(--status-gap)' }}>
        {title}
      </h4>
      <p style={{ fontSize: '13px', color: 'var(--text-primary)', maxWidth: '460px', lineHeight: 1.5 }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          className="sl-btn sl-btn-secondary sl-btn-sm"
          onClick={onRetry}
          style={{ marginTop: '8px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
}

export default { LoadingState, EmptyState, ErrorState };
