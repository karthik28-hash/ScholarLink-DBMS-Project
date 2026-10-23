import React from 'react';

export function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="sl-modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="sl-modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isDestructive ? 'var(--status-gap-bg)' : 'var(--surface-pale-blue)',
              color: isDestructive ? 'var(--status-gap)' : 'var(--primary-action)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {isDestructive ? 'delete_forever' : 'help_outline'}
            </span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {title}
          </h3>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="sl-btn sl-btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`sl-btn ${isDestructive ? 'sl-btn-destructive' : 'sl-btn-primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="sl-toast-container" aria-live="polite">
      {toasts.map((toast) => {
        const typeClass =
          toast.type === 'error'
            ? 'sl-toast-error'
            : toast.type === 'info'
            ? 'sl-toast-info'
            : 'sl-toast-success';

        const iconName =
          toast.type === 'error'
            ? 'error_outline'
            : toast.type === 'info'
            ? 'info'
            : 'check_circle';

        const iconColor =
          toast.type === 'error'
            ? 'var(--status-gap)'
            : toast.type === 'info'
            ? 'var(--primary-action)'
            : 'var(--status-verified)';

        return (
          <div key={toast.id} className={`sl-toast ${typeClass}`}>
            <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: '20px' }}>
              {iconName}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              {toast.title && (
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {toast.title}
                </div>
              )}
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                {toast.message}
              </div>
            </div>
            {onDismiss && (
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '2px',
                }}
                aria-label="Dismiss notification"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default { ConfirmDialog, Toast };
