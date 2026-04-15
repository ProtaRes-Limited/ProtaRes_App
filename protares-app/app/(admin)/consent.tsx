import React, { useState } from 'react';
import { Text } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { AdminTable, AdminColumn, DetailModal, StatusPill } from '@/components/admin/AdminTable';
import { useAdminQuery } from '@/hooks/useAdminQuery';
import { colors } from '@/config/theme';

const columns: AdminColumn[] = [
  { key: 'consent_type', label: 'Type', flex: 1, render: r => <Text style={{ fontSize: 12, color: colors.nhsBlue, fontWeight: '600' }}>{String(r.consent_type ?? '—')}</Text> },
  { key: 'granted', label: 'Status', flex: 1, render: r => <StatusPill status={r.granted ? 'granted' : 'withdrawn'} /> },
  { key: 'responder_id', label: 'Responder', flex: 2, render: r => <Text style={{ fontSize: 11, color: colors.grey2 }}>{String(r.responder_id ?? '—').slice(0, 12)}…</Text> },
  { key: 'created_at', label: 'Recorded', flex: 1, render: r => <Text style={{ fontSize: 11, color: colors.grey3 }}>{new Date(String(r.created_at)).toLocaleDateString('en-GB')}</Text> },
];

export default function AdminConsent() {
  const { data, loading } = useAdminQuery({ table: 'consent_records' });
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  const fields = selected ? [
    { label: 'ID', value: String(selected.id) },
    { label: 'Type', value: String(selected.consent_type ?? '—') },
    { label: 'Granted', value: selected.granted ? 'Yes' : 'No' },
    { label: 'Responder ID', value: String(selected.responder_id ?? '—') },
    { label: 'Version', value: String(selected.version ?? '—') },
    { label: 'IP address', value: String(selected.ip_address ?? '—') },
    { label: 'User agent', value: String(selected.user_agent ?? '—') },
    { label: 'Recorded', value: selected.created_at ? new Date(String(selected.created_at)).toLocaleString('en-GB') : '—' },
  ] : [];

  return (
    <Screen padded={false}>
      <Header title="Consent records" subtitle="UK GDPR Article 7" showBack />
      <AdminTable columns={columns} data={data} loading={loading} onRowPress={setSelected} />
      <DetailModal visible={!!selected} title="Consent record" onClose={() => setSelected(null)} fields={fields} />
    </Screen>
  );
}
