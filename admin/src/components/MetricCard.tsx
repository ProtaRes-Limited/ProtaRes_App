import React from 'react';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: string;
}

export function MetricCard({ label, value, sub, color = 'var(--nhs-blue)', icon }: Props) {
  return (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      {icon && (
        <div style={{
          width: 44, height: 44, borderRadius: 8,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>
          {icon}
        </div>
      )}
      <div>
        <div style={{ fontSize: 13, color: 'var(--grey3)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--grey3)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}
