import React, { useState } from 'react';
import { Text } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { AdminTable, AdminColumn, DetailModal, StatusPill } from '@/components/admin/AdminTable';
import { useAdminQuery } from '@/hooks/useAdminQuery';
import { colors } from '@/config/theme';

const columns: AdminColumn[] = [
  { key: 'status', label: 'Status', flex: 1, render: r => <StatusPill status={String(r.status ?? 'unknown')} /> },
  { key: 'responder_id', label: 'Responder', flex: 2, render: r => <Text style={{ fontSize: 11, fontFamily: 'monospace', color: colors.grey2 }}>{String(r.responder_id ?? '—').slice(0, 12)}…</Text> },
  { key: 'response_time_seconds', label: 'Time', flex: 1, render: r => <Text style={{ fontSize: 12 }}>{r.response_time_seconds ? `${r.response_time_seconds}s` : '—'}</Text> },
  { key: 'distance_km', label: 'Dist.', flex: 1, render: r => <Text style={{ fontSize: 12 }}>{r.distance_km ? `${Number(r.distance_km).toFixed(1)}km` : '—'}</Text> },
];

export default function AdminResponses() {
  const { data, loading } = useAdminQuery({ table: 'responses' });
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  const fields = selected ? [
    { label: 'ID', value: String(selected.id) },
    { label: 'Status', value: <StatusPill status={String(selected.status)} /> },
    { label: 'Responder ID', value: String(selected.responder_id ?? '—') },
    { label: 'Emergency ID', value: String(selected.emergency_id ?? '—') },
    { label: 'Response time', value: selected.response_time_seconds ? `${selected.response_time_seconds}s` : '—' },
    { label: 'Distance', value: selected.distance_km ? `${Number(selected.distance_km).toFixed(2)} km` : '—' },
    { label: 'Transport mode', value: String(selected.transport_mode ?? '—') },
    { label: 'Alert method', value: String(selected.alert_method ?? '—') },
    { label: 'Notified', value: selected.notified_at ? new Date(String(selected.notified_at)).toLocaleString('en-GB') : '—' },
    { label: 'Accepted', value: selected.accepted_at ? new Date(String(selected.accepted_at)).toLocaleString('en-GB') : '—' },
    { label: 'Arrived', value: selected.arrived_at ? new Date(String(selected.arrived_at)).toLocaleString('en-GB') : '—' },
    { label: 'Completed', value: selected.completed_at ? new Date(String(selected.completed_at)).toLocaleString('en-GB') : '—' },
    { label: 'Decline reason', value: String(selected.decline_reason ?? '—') },
    { label: 'Corridor score', value: selected.corridor_score != null ? String(selected.corridor_score) : '—' },
  ] : [];

  return (
    <Screen padded={false}>
      <Header title="Responses" subtitle={`${data.length} total`} showBack />
      <AdminTable columns={columns} data={data} loading={loading} onRowPress={setSelected} />
      <DetailModal visible={!!selected} title="Response detail" onClose={() => setSelected(null)} fields={fields} />
    </Screen>
  );
}
