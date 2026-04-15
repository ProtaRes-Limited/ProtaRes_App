import React from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function DrillDown({ title, onClose, children }: Props) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--grey3)', padding: 4 }}
          >✕</button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

export function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
      <div style={{ width: 200, flexShrink: 0, fontWeight: 600, fontSize: 13, color: 'var(--grey2)' }}>{label}</div>
      <div style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
        {value ?? <span style={{ color: 'var(--grey4)' }}>—</span>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  panel: {
    width: '100%',
    maxWidth: 640,
    background: 'var(--white)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '2px solid var(--nhs-blue)',
    background: 'var(--white)',
    flexShrink: 0,
  },
  title: { fontSize: 16, fontWeight: 700, color: 'var(--nhs-blue)' },
  body: { flex: 1, overflow: 'auto', padding: '16px 24px' },
};
