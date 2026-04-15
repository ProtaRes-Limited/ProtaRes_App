import React, { useState } from 'react';
import { Text } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { AdminTable, AdminColumn, DetailModal, StatusPill } from '@/components/admin/AdminTable';
import { useAdminQuery } from '@/hooks/useAdminQuery';
import { colors } from '@/config/theme';

const columns: AdminColumn[] = [
  { key: 'emergency_type', label: 'Type', flex: 1, render: r => <Text style={{ fontSize: 12, color: colors.nhsBlue, fontWeight: '600' }}>{String(r.emergency_type ?? '—')}</Text> },
  { key: 'status', label: 'Status', flex: 1, render: r => <StatusPill status={String(r.status ?? 'unknown')} /> },
  { key: 'severity', label: 'Severity', flex: 1, render: r => <StatusPill status={String(r.severity ?? 'unknown')} /> },
  { key: 'created_at', label: 'Time', flex: 1, render: r => <Text style={{ fontSize: 11, color: colors.grey3 }}>{new Date(String(r.created_at)).toLocaleDateString('en-GB')}</Text> },
];

export default function AdminEmergencies() {
  const { data, loading } = useAdminQuery({ table: 'emergencies' });
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  const fields = selected ? [
    { label: 'ID', value: String(selected.id) },
    { label: 'Status', value: <StatusPill status={String(selected.status)} /> },
    { label: 'Type', value: String(selected.emergency_type ?? '—') },
    { label: 'Severity', value: <StatusPill status={String(selected.severity ?? 'unknown')} /> },
    { label: 'Description', value: String(selected.description ?? '—') },
    { label: 'Address', value: String(selected.address ?? '—') },
    { label: 'Latitude', value: String(selected.latitude ?? '—') },
    { label: 'Longitude', value: String(selected.longitude ?? '—') },
    { label: 'Reporter ID', value: String(selected.reporter_id ?? '—') },
    { label: 'Responses', value: String(selected.responses_count ?? 0) },
    { label: 'Created', value: selected.created_at ? new Date(String(selected.created_at)).toLocaleString('en-GB') : '—' },
    { label: 'Dispatched', value: selected.dispatched_at ? new Date(String(selected.dispatched_at)).toLocaleString('en-GB') : '—' },
    { label: 'Resolved', value: selected.resolved_at ? new Date(String(selected.resolved_at)).toLocaleString('en-GB') : '—' },
  ] : [];

  return (
    <Screen padded={false}>
      <Header title="Emergencies" subtitle={`${data.length} total`} showBack />
      <AdminTable columns={columns} data={data} loading={loading} onRowPress={setSelected} />
      <DetailModal
        visible={!!selected}
        title={`${selected?.emergency_type ?? 'Emergency'} — ${selected?.status ?? ''}`}
        onClose={() => setSelected(null)}
        fields={fields}
      />
    </Screen>
  );
}
