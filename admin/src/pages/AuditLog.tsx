import React, { useEffect, useState } from 'react';
import { adminSupabase } from '../lib/supabase';
import { DataTable, Column } from '../components/DataTable';
import { DrillDown, FieldRow } from '../components/DrillDown';

type AuditEntry = Record<string, unknown>;

export function AuditLog() {
  const [data, setData] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  useEffect(() => {
    adminSupabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(500)
      .then(({ data }) => { setData((data ?? []) as AuditEntry[]); setLoading(false); });
  }, []);

  const columns: Column<AuditEntry>[] = [
    { key: 'id', label: 'ID', render: r => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{String(r.id).slice(0,8)}…</span> },
    { key: 'action', label: 'Action', render: r => <span className="badge badge-blue">{String(r.action ?? '—')}</span> },
    { key: 'table_name', label: 'Table' },
    { key: 'actor_id', label: 'Actor', render: r => r.actor_id ? <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(r.actor_id).slice(0,8)}…</span> : '—' },
    { key: 'record_id', label: 'Record', render: r => r.record_id ? <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(r.record_id).slice(0,8)}…</span> : '—' },
    { key: 'ip_address', label: 'IP' },
    { key: 'created_at', label: 'Time', render: r => new Date(String(r.created_at)).toLocaleString('en-GB') },
  ];

  return (
    <div>
      <PageHeader title="Audit log" sub="Last 500 entries · all actions are immutable" />
      <DataTable columns={columns} data={data} keyField="id" onRowClick={setSelected} loading={loading} />

      {selected && (
        <DrillDown title="Audit entry" onClose={() => setSelected(null)}>
          <FieldRow label="ID" value={String(selected.id)} />
          <FieldRow label="Action" value={String(selected.action ?? '—')} />
          <FieldRow label="Table" value={String(selected.table_name ?? '—')} />
          <FieldRow label="Record ID" value={String(selected.record_id ?? '—')} />
          <FieldRow label="Actor ID" value={String(selected.actor_id ?? '—')} />
          <FieldRow label="Actor type" value={String(selected.actor_type ?? '—')} />
          <FieldRow label="IP address" value={String(selected.ip_address ?? '—')} />
          <FieldRow label="User agent" value={String(selected.user_agent ?? '—')} />
          <FieldRow label="Time" value={new Date(String(selected.created_at)).toLocaleString('en-GB')} />
          {selected.old_data && (
            <FieldRow label="Old data" value={
              <pre style={{ fontSize: 11, background: 'var(--pale-grey)', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 200 }}>
                {JSON.stringify(selected.old_data, null, 2)}
              </pre>
            } />
          )}
          {selected.new_data && (
            <FieldRow label="New data" value={
              <pre style={{ fontSize: 11, background: 'var(--pale-grey)', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 200 }}>
                {JSON.stringify(selected.new_data, null, 2)}
              </pre>
            } />
          )}
        </DrillDown>
      )}
    </div>
  );
}

function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--nhs-blue)' }}>{title}</h1>
      {sub && <p style={{ color: 'var(--grey3)', fontSize: 13, marginTop: 2 }}>{sub}</p>}
    </div>
  );
}
