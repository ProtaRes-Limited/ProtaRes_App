import React, { useEffect, useState } from 'react';
import { adminSupabase } from '../lib/supabase';
import { DataTable, Column } from '../components/DataTable';
import { DrillDown, FieldRow } from '../components/DrillDown';

type Responder = Record<string, unknown>;

const TIERS: Record<string, string> = {
  tier1_active_healthcare: 'Tier 1 — Active Healthcare',
  tier2_retired_healthcare: 'Tier 2 — Retired Healthcare',
  tier3_first_aid: 'Tier 3 — First Aider',
  tier4_witness: 'Tier 4 — Witness',
};

export function Responders() {
  const [data, setData] = useState<Responder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Responder | null>(null);

  useEffect(() => {
    adminSupabase.from('responders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setData((data ?? []) as Responder[]); setLoading(false); });
  }, []);

  const columns: Column<Responder>[] = [
    { key: 'id', label: 'ID', render: r => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{String(r.id).slice(0,8)}…</span> },
    { key: 'first_name', label: 'Name', render: r => `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim() || '—' },
    { key: 'email', label: 'Email' },
    { key: 'tier', label: 'Tier', render: r => <span className="badge badge-blue">{TIERS[String(r.tier)] ?? String(r.tier)}</span> },
    { key: 'availability', label: 'Status', render: r => (
      <span className={`badge ${r.availability === 'available' ? 'badge-green' : 'badge-grey'}`}>{String(r.availability ?? 'unknown')}</span>
    )},
    { key: 'location_consent', label: 'Loc consent', render: r => (
      <span className={`badge ${r.location_consent ? 'badge-green' : 'badge-grey'}`}>{r.location_consent ? 'Yes' : 'No'}</span>
    )},
    { key: 'total_responses', label: 'Responses' },
    { key: 'created_at', label: 'Joined', render: r => new Date(String(r.created_at)).toLocaleDateString('en-GB') },
  ];

  return (
    <div>
      <PageHeader title="Responders" sub={`${data.length} registered`} />
      <DataTable columns={columns} data={data} keyField="id" onRowClick={setSelected} loading={loading} />

      {selected && (
        <DrillDown title={`${selected.first_name ?? ''} ${selected.last_name ?? ''} — Responder`} onClose={() => setSelected(null)}>
          <FieldRow label="ID" value={String(selected.id)} />
          <FieldRow label="Email" value={String(selected.email ?? '—')} />
          <FieldRow label="Phone" value={String(selected.phone ?? '—')} />
          <FieldRow label="Tier" value={TIERS[String(selected.tier)] ?? String(selected.tier)} />
          <FieldRow label="Availability" value={String(selected.availability ?? '—')} />
          <FieldRow label="Alert radius" value={selected.alert_radius_km ? `${selected.alert_radius_km} km` : '—'} />
          <FieldRow label="Location consent" value={selected.location_consent ? 'Yes' : 'No'} />
          <FieldRow label="Location consent at" value={selected.location_consent_at ? new Date(String(selected.location_consent_at)).toLocaleString('en-GB') : '—'} />
          <FieldRow label="Push enabled" value={selected.push_enabled ? 'Yes' : 'No'} />
          <FieldRow label="SMS fallback" value={selected.sms_fallback_enabled ? 'Yes' : 'No'} />
          <FieldRow label="Total responses" value={String(selected.total_responses ?? 0)} />
          <FieldRow label="Total accepted" value={String(selected.total_accepted ?? 0)} />
          <FieldRow label="Avg response time" value={selected.average_response_time_seconds ? `${Math.round(Number(selected.average_response_time_seconds))}s` : '—'} />
          <FieldRow label="Green badge" value={selected.green_badge_verified ? '✅ Verified' : '❌ Not verified'} />
          <FieldRow label="Joined" value={new Date(String(selected.created_at)).toLocaleString('en-GB')} />
          <FieldRow label="Last updated" value={new Date(String(selected.updated_at)).toLocaleString('en-GB')} />
          <FieldRow label="Deletion scheduled" value={selected.deletion_scheduled_at ? new Date(String(selected.deletion_scheduled_at)).toLocaleString('en-GB') : 'No'} />
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
