import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { AdminTable, AdminColumn, DetailModal, StatusPill } from '@/components/admin/AdminTable';
import { useAdminQuery } from '@/hooks/useAdminQuery';
import { supabase } from '@/services/supabase';
import { colors, spacing } from '@/config/theme';

const columns: AdminColumn[] = [
  { key: 'status', label: 'Status', flex: 1, render: r => <StatusPill status={String(r.status ?? 'unknown')} /> },
  { key: 'credential_type', label: 'Type', flex: 1, render: r => <Text style={{ fontSize: 12, color: colors.nhsBlue, fontWeight: '600' }}>{String(r.credential_type ?? '—').toUpperCase()}</Text> },
  { key: 'registration_number', label: 'Reg no.', flex: 2 },
  { key: 'created_at', label: 'Submitted', flex: 1, render: r => <Text style={{ fontSize: 11, color: colors.grey3 }}>{new Date(String(r.created_at)).toLocaleDateString('en-GB')}</Text> },
];

export default function AdminCredentials() {
  const { data, loading, reload } = useAdminQuery({ table: 'credentials' });
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  const pending = data.filter(r => r.status === 'pending').length;

  const handleVerdict = async (verdict: 'verified' | 'rejected') => {
    if (!selected) return;
    setSaving(true);
    const now = new Date().toISOString();
    await supabase.from('credentials').update({
      status: verdict,
      verified_at: verdict === 'verified' ? now : null,
    }).eq('id', selected.id);

    if (verdict === 'verified') {
      await supabase.from('responders')
        .update({ green_badge_verified: true, green_badge_verified_at: now })
        .eq('id', selected.responder_id);
    }

    Alert.alert(verdict === 'verified' ? 'Credential verified ✓' : 'Credential rejected', verdict === 'verified' ? 'Green Badge has been granted.' : 'The responder will be notified.');
    reload();
    setSaving(false);
    setSelected(null);
  };

  const fields = selected ? [
    { label: 'ID', value: String(selected.id) },
    { label: 'Status', value: <StatusPill status={String(selected.status)} /> },
    { label: 'Responder ID', value: String(selected.responder_id ?? '—') },
    { label: 'Type', value: String(selected.credential_type ?? '—').toUpperCase() },
    { label: 'Reg body', value: String(selected.body ?? '—') },
    { label: 'Reg number', value: String(selected.registration_number ?? '—') },
    { label: 'Name on cert', value: String(selected.full_name ?? '—') },
    { label: 'Expiry', value: selected.expiry_date ? new Date(String(selected.expiry_date)).toLocaleDateString('en-GB') : '—' },
    { label: 'Submitted', value: selected.created_at ? new Date(String(selected.created_at)).toLocaleString('en-GB') : '—' },
    { label: 'Verified at', value: selected.verified_at ? new Date(String(selected.verified_at)).toLocaleString('en-GB') : '—' },
    { label: 'Rejection reason', value: String(selected.rejection_reason ?? '—') },
  ] : [];

  return (
    <Screen padded={false}>
      <Header title="Credentials" subtitle={pending > 0 ? `${pending} pending review` : 'All clear'} showBack />
      <AdminTable columns={columns} data={data} loading={loading} onRowPress={setSelected} />

      <DetailModal
        visible={!!selected}
        title={`${String(selected?.credential_type ?? '').toUpperCase()} — ${String(selected?.status ?? '')}`}
        onClose={() => setSelected(null)}
        fields={fields}
        actions={
          String(selected?.status) === 'pending' ? (
            <View style={styles.actions}>
              <Button label="✓ Verify & grant Green Badge" onPress={() => handleVerdict('verified')} loading={saving} fullWidth />
              <Button label="✕ Reject" variant="outline" onPress={() => handleVerdict('rejected')} loading={saving} fullWidth />
            </View>
          ) : undefined
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.md },
});
