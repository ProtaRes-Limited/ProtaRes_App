import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { AdminTable, AdminColumn, DetailModal, StatusPill } from '@/components/admin/AdminTable';
import { useAdminQuery } from '@/hooks/useAdminQuery';
import { supabase } from '@/services/supabase';
import { colors } from '@/config/theme';

const TIERS: Record<string, string> = {
  tier1_active_healthcare: 'Tier 1 — Active Healthcare',
  tier2_retired_healthcare: 'Tier 2 — Retired Healthcare',
  tier3_first_aid: 'Tier 3 — First Aider',
  tier4_witness: 'Tier 4 — Witness',
};

const columns: AdminColumn[] = [
  { key: 'name', label: 'Name', flex: 2, render: r => <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>{`${r.first_name ?? ''} ${r.last_name ?? ''}`.trim() || '—'}</Text> },
  { key: 'availability', label: 'Status', flex: 1, render: r => <StatusPill status={String(r.availability ?? 'unknown')} /> },
  { key: 'tier', label: 'Tier', flex: 1, render: r => <Text style={{ fontSize: 11, color: colors.grey2 }}>{String(r.tier ?? '—').replace('tier', 'T').split('_')[0]}</Text> },
];

export default function AdminResponders() {
  const { data, loading, reload } = useAdminQuery({ table: 'responders' });
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSuspend = async () => {
    if (!selected) return;
    setSaving(true);
    await supabase.from('responders').update({ availability: 'suspended' }).eq('id', selected.id);
    reload();
    setSaving(false);
    setSelected(null);
  };

  const fields = selected ? [
    { label: 'ID', value: String(selected.id) },
    { label: 'Email', value: String(selected.email ?? '—') },
    { label: 'Phone', value: String(selected.phone ?? '—') },
    { label: 'Tier', value: TIERS[String(selected.tier)] ?? String(selected.tier) },
    { label: 'Availability', value: <StatusPill status={String(selected.availability ?? 'unknown')} /> },
    { label: 'Alert radius', value: selected.alert_radius_km ? `${selected.alert_radius_km} km` : '—' },
    { label: 'Location consent', value: selected.location_consent ? 'Yes' : 'No' },
    { label: 'Green badge', value: selected.green_badge_verified ? '✅ Verified' : '❌ Not verified' },
    { label: 'Total responses', value: String(selected.total_responses ?? 0) },
    { label: 'Avg response time', value: selected.average_response_time_seconds ? `${Math.round(Number(selected.average_response_time_seconds))}s` : '—' },
    { label: 'Joined', value: selected.created_at ? new Date(String(selected.created_at)).toLocaleDateString('en-GB') : '—' },
  ] : [];

  return (
    <Screen padded={false}>
      <Header title="Responders" subtitle={`${data.length} registered`} showBack />
      <AdminTable columns={columns} data={data} loading={loading} onRowPress={setSelected} />

      <DetailModal
        visible={!!selected}
        title={selected ? `${selected.first_name ?? ''} ${selected.last_name ?? ''}`.trim() : ''}
        onClose={() => setSelected(null)}
        fields={fields}
        actions={
          selected?.availability !== 'suspended' ? (
            <Button label="Suspend account" variant="outline" onPress={handleSuspend} loading={saving} fullWidth />
          ) : (
            <View>
              <Button
                label="Reinstate account"
                onPress={async () => {
                  setSaving(true);
                  await supabase.from('responders').update({ availability: 'unavailable' }).eq('id', selected?.id);
                  reload();
                  setSaving(false);
                  setSelected(null);
                }}
                loading={saving}
                fullWidth
              />
            </View>
          )
        }
      />
    </Screen>
  );
}
