import React, { useState } from 'react';
import { Text } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { AdminTable, AdminColumn, DetailModal } from '@/components/admin/AdminTable';
import { useAdminQuery } from '@/hooks/useAdminQuery';
import { colors } from '@/config/theme';

const columns: AdminColumn[] = [
  { key: 'action', label: 'Action', flex: 1, render: r => <Text style={{ fontSize: 12, color: colors.nhsBlue, fontWeight: '600' }}>{String(r.action ?? '—')}</Text> },
  { key: 'table_name', label: 'Table', flex: 1 },
  { key: 'actor_id', label: 'Actor', flex: 1, render: r => <Text style={{ fontSize: 11, color: colors.grey2 }}>{r.actor_id ? String(r.actor_id).slice(0, 8) + '…' : 'system'}</Text> },
  { key: 'created_at', label: 'Time', flex: 1, render: r => <Text style={{ fontSize: 11, color: colors.grey3 }}>{new Date(String(r.created_at)).toLocaleDateString('en-GB')}</Text> },
];

export default function AdminAudit() {
  const { data, loading } = useAdminQuery({ table: 'audit_log', limit: 500 });
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  const fields = selected ? [
    { label: 'ID', value: String(selected.id) },
    { label: 'Action', value: String(selected.action ?? '—') },
    { label: 'Table', value: String(selected.table_name ?? '—') },
    { label: 'Record ID', value: String(selected.record_id ?? '—') },
    { label: 'Actor ID', value: String(selected.actor_id ?? 'system') },
    { label: 'Actor type', value: String(selected.actor_type ?? '—') },
    { label: 'IP address', value: String(selected.ip_address ?? '—') },
    { label: 'Time', value: selected.created_at ? new Date(String(selected.created_at)).toLocaleString('en-GB') : '—' },
    { label: 'Old data', value: selected.old_data ? JSON.stringify(selected.old_data, null, 2) : '—' },
    { label: 'New data', value: selected.new_data ? JSON.stringify(selected.new_data, null, 2) : '—' },
  ] : [];

  return (
    <Screen padded={false}>
      <Header title="Audit log" subtitle="Last 500 · immutable" showBack />
      <AdminTable columns={columns} data={data} loading={loading} onRowPress={setSelected} />
      <DetailModal visible={!!selected} title="Audit entry" onClose={() => setSelected(null)} fields={fields} />
    </Screen>
  );
}
