import React, { useEffect, useState } from 'react';
import { adminSupabase } from '../lib/supabase';
import { DataTable, Column } from '../components/DataTable';
import { DrillDown, FieldRow } from '../components/DrillDown';

type NotifEntry = Record<string, unknown>;

export function NotificationLog() {
  const [data, setData] = useState<NotifEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NotifEntry | null>(null);

  useEffect(() => {
    adminSupabase.from('notification_log').select('*').order('created_at', { ascending: false }).limit(500)
      .then(({ data }) => { setData((data ?? []) as NotifEntry[]); setLoading(false); });
  }, []);

  const columns: Column<NotifEntry>[] = [
    { key: 'id', label: 'ID', render: r => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{String(r.id).slice(0,8)}…</span> },
    { key: 'channel', label: 'Channel', render: r => <span className="badge badge-blue">{String(r.channel ?? '—')}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={String(r.status)} /> },
    { key: 'notification_type', label: 'Type' },
    { key: 'responder_id', label: 'Recipient', render: r => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(r.responder_id ?? '—').slice(0,8)}…</span> },
    { key: 'emergency_id', label: 'Emergency', render: r => r.emergency_id ? <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(r.emergency_id).slice(0,8)}…</span> : '—' },
    { key: 'created_at', label: 'Sent', render: r => new Date(String(r.created_at)).toLocaleString('en-GB') },
  ];

  return (
    <div>
      <PageHeader title="Notification log" sub="Last 500 · push, SMS, and in-app alerts" />
      <DataTable columns={columns} data={data} keyField="id" onRowClick={setSelected} loading={loading} />

      {selected && (
        <DrillDown title="Notification detail" onClose={() => setSelected(null)}>
          <FieldRow label="ID" value={String(selected.id)} />
          <FieldRow label="Channel" value={String(selected.channel ?? '—')} />
          <FieldRow label="Status" value={<StatusBadge status={String(selected.status)} />} />
          <FieldRow label="Type" value={String(selected.notification_type ?? '—')} />
          <FieldRow label="Recipient" value={String(selected.responder_id ?? '—')} />
          <FieldRow label="Emergency ID" value={String(selected.emergency_id ?? '—')} />
          <FieldRow label="Title" value={String(selected.title ?? '—')} />
          <FieldRow label="Body" value={String(selected.body ?? '—')} />
          <FieldRow label="Provider ref" value={String(selected.provider_message_id ?? '—')} />
          <FieldRow label="Error" value={String(selected.error_message ?? '—')} />
          <FieldRow label="Sent" value={new Date(String(selected.created_at)).toLocaleString('en-GB')} />
          <FieldRow label="Delivered at" value={selected.delivered_at ? new Date(String(selected.delivered_at)).toLocaleString('en-GB') : '—'} />
        </DrillDown>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { sent: 'badge-blue', delivered: 'badge-green', failed: 'badge-red', pending: 'badge-yellow' };
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
