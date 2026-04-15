import React, { useEffect, useState } from 'react';
import { adminSupabase } from '../lib/supabase';
import { DataTable, Column } from '../components/DataTable';
import { DrillDown, FieldRow } from '../components/DrillDown';

type Response = Record<string, unknown>;

export function Responses() {
  const [data, setData] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Response | null>(null);

  useEffect(() => {
    adminSupabase.from('responses').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setData((data ?? []) as Response[]); setLoading(false); });
  }, []);

  const columns: Column<Response>[] = [
    { key: 'id', label: 'ID', render: r => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{String(r.id).slice(0,8)}…</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={String(r.status)} /> },
    { key: 'responder_id', label: 'Responder', render: r => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(r.responder_id ?? '—').slice(0,8)}…</span> },
    { key: 'emergency_id', label: 'Emergency', render: r => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(r.emergency_id ?? '—').slice(0,8)}…</span> },
    { key: 'response_time_seconds', label: 'Response time', render: r => r.response_time_seconds ? `${r.response_time_seconds}s` : '—' },
    { key: 'distance_km', label: 'Distance', render: r => r.distance_km ? `${Number(r.distance_km).toFixed(2)} km` : '—' },
    { key: 'created_at', label: 'Created', render: r => new Date(String(r.created_at)).toLocaleString('en-GB') },
  ];

  return (
    <div>
      <PageHeader title="Responses" sub={`${data.length} total`} />
      <DataTable columns={columns} data={data} keyField="id" onRowClick={setSelected} loading={loading} />

      {selected && (
        <DrillDown title="Response detail" onClose={() => setSelected(null)}>
          <FieldRow label="ID" value={String(selected.id)} />
          <FieldRow label="Status" value={<StatusBadge status={String(selected.status)} />} />
          <FieldRow label="Responder ID" value={String(selected.responder_id ?? '—')} />
          <FieldRow label="Emergency ID" value={String(selected.emergency_id ?? '—')} />
          <FieldRow label="Response time" value={selected.response_time_seconds ? `${selected.response_time_seconds}s` : '—'} />
          <FieldRow label="Distance" value={selected.distance_km ? `${Number(selected.distance_km).toFixed(2)} km` : '—'} />
          <FieldRow label="Transport mode" value={String(selected.transport_mode ?? '—')} />
          <FieldRow label="Alert method" value={String(selected.alert_method ?? '—')} />
          <FieldRow label="Notified at" value={selected.notified_at ? new Date(String(selected.notified_at)).toLocaleString('en-GB') : '—'} />
          <FieldRow label="Accepted at" value={selected.accepted_at ? new Date(String(selected.accepted_at)).toLocaleString('en-GB') : '—'} />
          <FieldRow label="Arrived at" value={selected.arrived_at ? new Date(String(selected.arrived_at)).toLocaleString('en-GB') : '—'} />
          <FieldRow label="Completed at" value={selected.completed_at ? new Date(String(selected.completed_at)).toLocaleString('en-GB') : '—'} />
          <FieldRow label="Decline reason" value={String(selected.decline_reason ?? '—')} />
          <FieldRow label="Corridor score" value={selected.corridor_score != null ? String(selected.corridor_score) : '—'} />
          <FieldRow label="Created" value={new Date(String(selected.created_at)).toLocaleString('en-GB')} />
        </DrillDown>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { accepted: 'badge-blue', declined: 'badge-grey', en_route: 'badge-purple', arrived: 'badge-green', completed: 'badge-green', cancelled: 'badge-grey', pending: 'badge-yellow' };
  return <span className={`badge ${map[status] ?? 'badge-grey'}`}>{status}</span>;
}

function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--nhs-blue)' }}>{title}</h1>
      {sub && <p style={{ color: 'var(--grey3)', fontSize: 13, marginTop: 2 }}>{sub}</p>}
    </div>
  );
}
