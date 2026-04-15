import React, { useEffect, useState } from 'react';
import { adminSupabase } from '../lib/supabase';
import { DataTable, Column } from '../components/DataTable';
import { DrillDown, FieldRow } from '../components/DrillDown';

type Consent = Record<string, unknown>;

export function ConsentRecords() {
  const [data, setData] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Consent | null>(null);

  useEffect(() => {
    adminSupabase.from('consent_records').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setData((data ?? []) as Consent[]); setLoading(false); });
  }, []);

  const columns: Column<Consent>[] = [
    { key: 'id', label: 'ID', render: r => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{String(r.id).slice(0,8)}…</span> },
    { key: 'consent_type', label: 'Type', render: r => <span className="badge badge-blue">{String(r.consent_type ?? '—')}</span> },
    { key: 'granted', label: 'Status', render: r => <span className={`badge ${r.granted ? 'badge-green' : 'badge-red'}`}>{r.granted ? 'Granted' : 'Withdrawn'}</span> },
    { key: 'responder_id', label: 'Responder', render: r => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(r.responder_id ?? '—').slice(0,8)}…</span> },
    { key: 'version', label: 'Version' },
    { key: 'ip_address', label: 'IP' },
    { key: 'created_at', label: 'Recorded', render: r => new Date(String(r.created_at)).toLocaleString('en-GB') },
  ];

  return (
    <div>
      <PageHeader title="Consent records" sub="UK GDPR Article 7 — immutable consent ledger" />
      <DataTable columns={columns} data={data} keyField="id" onRowClick={setSelected} loading={loading} />

      {selected && (
        <DrillDown title="Consent record" onClose={() => setSelected(null)}>
          <FieldRow label="ID" value={String(selected.id)} />
          <FieldRow label="Type" value={String(selected.consent_type ?? '—')} />
          <FieldRow label="Granted" value={selected.granted ? 'Yes' : 'No'} />
          <FieldRow label="Responder ID" value={String(selected.responder_id ?? '—')} />
          <FieldRow label="Version" value={String(selected.version ?? '—')} />
          <FieldRow label="IP address" value={String(selected.ip_address ?? '—')} />
          <FieldRow label="User agent" value={String(selected.user_agent ?? '—')} />
          <FieldRow label="Recorded" value={new Date(String(selected.created_at)).toLocaleString('en-GB')} />
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
