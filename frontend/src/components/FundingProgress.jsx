import React from 'react';
import { formatINR } from './CurrencyValue.jsx';

export default function FundingProgress({
  totalCost = 0,
  assistance = 0,
  gap = 0,
  surplus = 0,
  showLabels = true,
  height = 16,
}) {
  const costNum = Math.max(0, Number(totalCost) || 0);
  const assistanceNum = Math.max(0, Number(assistance) || 0);
  const gapNum = Math.max(0, Number(gap) || 0);
  const surplusNum = Math.max(0, Number(surplus) || 0);

  // Proportional percentages
  let assistancePct = 0;
  let gapPct = 0;
  let surplusPct = 0;

  if (costNum > 0) {
    if (assistanceNum >= costNum) {
      assistancePct = 100;
      gapPct = 0;
      surplusPct = Math.round(((assistanceNum - costNum) / costNum) * 100);
    } else {
      assistancePct = Math.min(100, Math.round((assistanceNum / costNum) * 100));
      gapPct = Math.max(0, 100 - assistancePct);
    }
  } else if (assistanceNum > 0) {
    assistancePct = 100;
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Visual multi-segment bar */}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'var(--surface-neutral)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          display: 'flex',
          border: '1px solid var(--border-hairline)',
          padding: '2px',
          gap: '2px',
        }}
        role="progressbar"
        aria-valuenow={assistancePct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Education funding coverage"
      >
        {assistancePct > 0 && (
          <div
            style={{
              width: `${assistancePct}%`,
              backgroundColor: 'var(--primary-action)',
              borderRadius: '2px',
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '6px',
              color: '#ffffff',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
            title={`Recorded Grants: ${formatINR(assistanceNum)} (${assistancePct}%)`}
          >
            {height >= 14 && assistancePct >= 12 ? `${assistancePct}%` : ''}
          </div>
        )}
        {gapPct > 0 && (
          <div
            style={{
              width: `${gapPct}%`,
              backgroundColor: 'var(--status-gap)',
              borderRadius: '2px',
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '6px',
              color: '#ffffff',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
            title={`Remaining Gap: ${formatINR(gapNum)} (${gapPct}%)`}
          >
            {height >= 14 && gapPct >= 12 ? `${gapPct}%` : ''}
          </div>
        )}
      </div>

      {showLabels && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>₹0 (Zero Coverage)</span>
          <span>Target Obligation: {formatINR(costNum)}</span>
        </div>
      )}
    </div>
  );
}
