import React from 'react';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export function formatINR(val) {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return '—';
  }
  return inrFormatter.format(Number(val));
}

export default function CurrencyValue({ value, className = '', showSymbol = true }) {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return <span className={`font-mono text-muted ${className}`}>—</span>;
  }

  const formatted = formatINR(value);
  return (
    <span className={`numeric font-mono ${className}`}>
      {formatted}
    </span>
  );
}
