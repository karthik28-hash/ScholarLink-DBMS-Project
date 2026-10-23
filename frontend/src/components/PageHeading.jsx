import React from 'react';

export default function PageHeading({
  contextBadge = 'Academic Year 2026–27',
  subBadge = 'ScholarLink Central Node',
  titleRegular = 'Understand your',
  titleItalic = 'education funding.',
  description = 'A consolidated institutional balance of audited academic fees, tripartite foundation grants, and your calculated funding gap.',
  actions,
  badgeType = 'academic',
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '28px',
        gap: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ maxWidth: '820px' }}>
          {/* Metadata chips */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '10px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                backgroundColor: 'var(--surface-neutral)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-action)',
                }}
              />
              {contextBadge}
            </span>

            {subBadge && (
              <>
                <span style={{ color: 'var(--border-hairline)', fontFamily: 'var(--font-mono)' }}>/</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {subBadge}
                </span>
              </>
            )}
          </div>

          {/* Editorial Display Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-interface)',
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            {titleRegular}{' '}
            <em
              style={{
                fontFamily: 'var(--font-editorial)',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: '32px',
                letterSpacing: '-0.01em',
                color: 'var(--text-primary)',
              }}
            >
              {titleItalic}
            </em>
          </h1>

          {/* Narrative Subtitle */}
          {description && (
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginTop: '8px',
                lineHeight: 1.55,
                maxWidth: '680px',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Right side demonstration stamp & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              backgroundColor: 'var(--surface-neutral)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
              gavel
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-interface)',
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-primary)',
                }}
              >
                Prototype Demonstration
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                }}
              >
                Non-binding institutional calculation
              </span>
            </div>
          </div>

          {actions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
