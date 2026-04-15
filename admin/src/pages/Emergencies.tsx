import React, { useEffect, useState } from 'react';
import { adminSupabase } from '../lib/supabase';
import { DataTable, Column } from '../components/DataTable';
import { DrillDown, FieldRow } from '../components/DrillDown';

type Emergency = Record<string, unknown>;

export function Emergencies() {
  const [data, setData] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Emergency | null>(null);
  const [relatedResponses, setRelatedResponses] = useState<Emergency[]>([]);

  useEffect(() => {
    adminSupabase.from('emergencies').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setData((data ?? []) as Emergency[]); setLoading(false); });
  }, []);

  const handleSelect = async (row: Emergency) => {
    setSelected(row);
    const { data } = await adminSupabase
      .from('responses')
      .select('*')
      .eq('emergency_id', row.id);
    setRelatedResponses((data ?? []) as Emergency[]);
  };

  const columns: Column<Emergency>[] = [
    { key: 'id', label: 'ID', render: r => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{String(r.id).slice(0,8)}…</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={String(r.status)} /> },
    { key: 'emergency_type', label: 'Type', render: r => <span className="badge badge-blue">{String(r.emergency_type ?? '—')}</span> },
    { key: 'severity', label: 'Severity', render: r => <SeverityBadge severity={String(r.severity)} /> },
    { key: 'reporter_id', label: 'Reported by', render: r => r.reporter_id ? <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(r.reporter_id).slice(0,8)}…</span> : '—' },
    { key: 'responses_count', label: 'Responses' },
    { key: 'created_at', label: 'Created', render: r => new Date(String(r.created_at)).toLocaleString('en-GB') },
    { key: 'resolved_at', label: 'Resolved', render: r => r.resolved_at ? new Date(String(r.resolved_at)).toLocaleString('en-GB') : '—' },
  ];

  return (
    <div>
      <PageHeader title="Emergencies" sub={`${data.length} total`} />
      <DataTable columns={columns} data={data} keyField="id" onRowClick={handleSelect} loading={loading} />

      {selected && (
        <DrillDown title={`Emergency — ${String(selected.emergency_type ?? 'Unknown')}`} onClose={() => setSelected(null)}>
          <FieldRow label="ID" value={String(selected.id)} />
          <FieldRow label="Status" value={<StatusBadge status={String(selected.status)} />} />
          <FieldRow label="Type" value={String(selected.emergency_type ?? '—')} />
          <FieldRow label="Severity" value={<SeverityBadge severity={String(selected.severity)} />} />
          <FieldRow label="Description" value={String(selected.description ?? '—')} />
          <FieldRow label="Reporter ID" value={String(selected.reporter_id ?? '—')} />
          <FieldRow label="Location (lat)" value={String(selected.latitude ?? '—')} />
          <FieldRow label="Location (lng)" value={String(selected.longitude ?? '—')} />
          <FieldRow label="Address" value={String(selected.address ?? '—')} />
          <FieldRow label="Responses" value={String(selected.responses_count ?? 0)} />
          <FieldRow label="Created" value={new Date(String(selected.created_at)).toLocaleString('en-GB')} />
          <FieldRow label="Dispatched at" value={selected.dispatched_at ? new Date(String(selected.dispatched_at)).toLocaleString('en-GB') : '—'} />
          <FieldRow label="Resolved at" value={selected.resolved_at ? new Date(String(selected.resolved_at)).toLocaleString('en-GB') : '—'} />
          <FieldRow label="Cancelled at" value={selected.cancelled_at ? new Date(String(selected.cancelled_at)).toLocaleString('en-GB') : '—'} />

          {relatedResponses.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--grey2)' }}>
                Responses to this emergency ({relatedResponses.length})
              </h4>
              <div className="card" style={{ overflow: 'hidden' }}>
                <table>
                  <thead><tr><th>Responder</th><th>Status</th><th>Response time</th></tr></thead>
                  <tbody>
                    {relatedResponses.map(r => (
                      <tr key={String(r.id)}>
                        <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(r.responder_id ?? '—').slice(0,8)}…</td>
                        <td><StatusBadge status={String(r.status)} /></td>
                        <td>{r.response_time_seconds ? `${r.response_time_seconds}s` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DrillDown>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { active: 'badge-red', resolved: 'badge-green', dispatched: 'badge-blue', cancelled: 'badge-grey', pending: 'badge-yellow', accepted: 'badge-blue', declined: 'badge-grey', en_route: 'badge-purple' };
  return <span className={`badge ${map[status] ?? 'badge-grey'}`}>{status}</span>;
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = { critical: 'badge-red', high: 'badge-yellow', medium: 'badge-blue', low: 'badge-grey' };
  return <span className={`badge ${map[severity] ?? 'badge-grey'}`}>{severity}</span>;
}

function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--nhs-blue)' }}>{title}</h1>
      {sub && <p style={{ color: 'var(--grey3)', fontSize: 13, marginTop: 2 }}>{sub}</p>}
    </div>
  );
}
