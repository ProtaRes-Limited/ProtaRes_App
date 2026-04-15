import React, { useState } from 'react';
import { Text } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { AdminTable, AdminColumn, DetailModal, StatusPill } from '@/components/admin/AdminTable';
import { useAdminQuery } from '@/hooks/useAdminQuery';
import { colors } from '@/config/theme';

const columns: AdminColumn[] = [
  { key: 'channel', label: 'Channel', flex: 1, render: r => <Text style={{ fontSize: 12, color: colors.nhsBlue, fontWeight: '600' }}>{String(r.channel ?? '—').toUpperCase()}</Text> },
  { key: 'status', label: 'Status', flex: 1, render: r => <StatusPill status={String(r.status ?? 'unknown')} /> },
  { key: 'notification_type', label: 'Type', flex: 1 },
  { key: 'created_at', label: 'Sent', flex: 1, render: r => <Text style={{ fontSize: 11, color: colors.grey3 }}>{new Date(String(r.created_at)).toLocaleDateString('en-GB')}</Text> },
];

export default function AdminNotifications() {
  const { data, loading } = useAdminQuery({ table: 'notification_log', limit: 500 });
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  const fields = selected ? [
    { label: 'ID', value: String(selected.id) },
    { label: 'Channel', value: String(selected.channel ?? '—').toUpperCase() },
    { label: 'Status', value: <StatusPill status={String(selected.status)} /> },
    { label: 'Type', value: String(selected.notification_type ?? '—') },
    { label: 'Recipient', value: String(selected.responder_id ?? '—') },
    { label: 'Emergency ID', value: String(selected.emergency_id ?? '—') },
    { label: 'Title', value: String(selected.title ?? '—') },
    { label: 'Body', value: String(selected.body ?? '—') },
    { label: 'Error', value: String(selected.error_message ?? '—') },
    { label: 'Sent', value: selected.created_at ? new Date(String(selected.created_at)).toLocaleString('en-GB') : '—' },
    { label: 'Delivered', value: selected.delivered_at ? new Date(String(selected.delivered_at)).toLocaleString('en-GB') : '—' },
  ] : [];

  return (
    <Screen padded={false}>
      <Header title="Notification log" subtitle="Last 500" showBack />
      <AdminTable columns={columns} data={data} loading={loading} onRowPress={setSelected} />
      <DetailModal visible={!!selected} title="Notification" onClose={() => setSelected(null)} fields={fields} />
    </Screen>
  );
}
