import React, { useEffect, useState } from 'react';
import { adminSupabase } from '../lib/supabase';
import { DataTable, Column } from '../components/DataTable';
import { DrillDown, FieldRow } from '../components/DrillDown';

type Credential = Record<string, unknown>;

export function Credentials() {
  const [data, setData] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Credential | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminSupabase.from('credentials').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setData((data ?? []) as Credential[]); setLoading(false); });
  }, []);

  const handleVerify = async (status: 'verified' | 'rejected') => {
    if (!selected) return;
    setSaving(true);
    await adminSupabase.from('credentials')
      .update({ status, verified_at: status === 'verified' ? new Date().toISOString() : null })
      .eq('id', selected.id);
    setData(prev => prev.map(r => r.id === selected.id ? { ...r, status } : r));
    setSelected(prev => prev ? { ...prev, status } : null);
    setSaving(false);
    // Update green badge on responder if verified
    if (status === 'verified') {
      await adminSupabase.from('responders')
        .update({ green_badge_verified: true, green_badge_verified_at: new Date().toISOString() })
        .eq('id', selected.responder_id);
    }
  };

  const columns: Column<Credential>[] = [
    { key: 'id', label: 'ID', render: r => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{String(r.id).slice(0,8)}…</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={String(r.status)} /> },
    { key: 'credential_type', label: 'Type', render: r => <span className="badge badge-blue">{String(r.credential_type ?? '—')}</span> },
    { key: 'body', label: 'Reg body', render: r => String(r.body ?? '—') },
    { key: 'registration_number', label: 'Reg number' },
    { key: 'responder_id', label: 'Responder', render: r => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(r.responder_id ?? '—').slice(0,8)}…</span> },
    { key: 'created_at', label: 'Submitted', render: r => new Date(String(r.created_at)).toLocaleString('en-GB') },
    { key: 'verified_at', label: 'Verified', render: r => r.verified_at ? new Date(String(r.verified_at)).toLocaleString('en-GB') : '—' },
  ];

  return (
    <div>
      <PageHeader title="Credentials" sub={`${data.filter(r => r.status === 'pending').length} pending review`} />
      <DataTable columns={columns} data={data} keyField="id" onRowClick={setSelected} loading={loading} />

      {selected && (
        <DrillDown title="Credential review" onClose={() => setSelected(null)}>
          <FieldRow label="ID" value={String(selected.id)} />
          <FieldRow label="Status" value={<StatusBadge status={String(selected.status)} />} />
          <FieldRow label="Responder ID" value={String(selected.responder_id ?? '—')} />
          <FieldRow label="Type" value={String(selected.credential_type ?? '—')} />
          <FieldRow label="Reg body" value={String(selected.body ?? '—')} />
          <FieldRow label="Reg number" value={String(selected.registration_number ?? '—')} />
          <FieldRow label="Full name on cert" value={String(selected.full_name ?? '—')} />
          <FieldRow label="Expiry date" value={selected.expiry_date ? new Date(String(selected.expiry_date)).toLocaleDateString('en-GB') : '—'} />
          <FieldRow label="Submitted" value={new Date(String(selected.created_at)).toLocaleString('en-GB')} />
          <FieldRow label="Verified at" value={selected.verified_at ? new Date(String(selected.verified_at)).toLocaleString('en-GB') : '—'} />
          <FieldRow label="Rejected at" value={selected.rejected_at ? new Date(String(selected.rejected_at)).toLocaleString('en-GB') : '—'} />
          <FieldRow label="Rejection reason" value={String(selected.rejection_reason ?? '—')} />

          {String(selected.status) === 'pending' && (
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <button className="btn-primary" disabled={saving} onClick={() => handleVerify('verified')} style={{ flex: 1 }}>
                {saving ? '…' : '✓ Verify & grant Green Badge'}
              </button>
              <button className="btn-danger" disabled={saving} onClick={() => handleVerify('rejected')} style={{ flex: 1 }}>
                {saving ? '…' : '✕ Reject'}
              </button>
            </div>
          )}
        </DrillDown>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { pending: 'badge-yellow', verified: 'badge-green', rejected: 'badge-red', expired: 'badge-grey' };
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
