import React, { useState } from 'react';
import {
  FlatList, Modal, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '@/config/theme';

export interface AdminColumn {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
  flex?: number;
}

interface Props {
  columns: AdminColumn[];
  data: Record<string, unknown>[];
  loading: boolean;
  onRowPress?: (row: Record<string, unknown>) => void;
  keyField?: string;
  emptyText?: string;
}

export function AdminTable({ columns, data, loading, onRowPress, keyField = 'id', emptyText = 'No records' }: Props) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? data.filter(row =>
        Object.values(row).some(v =>
          String(v ?? '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.nhsBlue} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={styles.search}
        placeholder="Search…"
        placeholderTextColor={colors.grey3}
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />

      {/* Header row */}
      <View style={styles.headerRow}>
        {columns.map(col => (
          <Text key={col.key} style={[styles.headerCell, { flex: col.flex ?? 1 }]} numberOfLines={1}>
            {col.label}
          </Text>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item[keyField] ?? Math.random())}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={onRowPress ? () => onRowPress(item) : undefined}
            activeOpacity={onRowPress ? 0.7 : 1}
          >
            {columns.map(col => (
              <View key={col.key} style={[styles.cell, { flex: col.flex ?? 1 }]}>
                {col.render
                  ? col.render(item)
                  : <Text style={styles.cellText} numberOfLines={2}>{String(item[col.key] ?? '—')}</Text>
                }
              </View>
            ))}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />

      <Text style={styles.count}>{filtered.length} of {data.length} records</Text>
    </View>
  );
}

// ── Detail panel (slide-up modal) ──────────────────────────────────────────

export interface FieldDef {
  label: string;
  value: React.ReactNode;
}

interface DetailProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  fields: FieldDef[];
  actions?: React.ReactNode;
}

export function DetailModal({ visible, title, onClose, fields, actions }: DetailProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={detail.root}>
        <View style={detail.header}>
          <Text style={detail.title} numberOfLines={1}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <X size={22} color={colors.grey2} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={detail.body}>
          {fields.map(({ label, value }) => (
            <View key={label} style={detail.field}>
              <Text style={detail.fieldLabel}>{label}</Text>
              {typeof value === 'string' || value == null
                ? <Text style={detail.fieldValue}>{value ?? '—'}</Text>
                : value
              }
            </View>
          ))}
          {actions && <View style={detail.actions}>{actions}</View>}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Status badge ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active:     { bg: '#FDECEA', text: '#DA291C' },
  available:  { bg: '#D4EDDA', text: '#155724' },
  resolved:   { bg: '#D4EDDA', text: '#155724' },
  verified:   { bg: '#D4EDDA', text: '#155724' },
  delivered:  { bg: '#D4EDDA', text: '#155724' },
  completed:  { bg: '#D4EDDA', text: '#155724' },
  accepted:   { bg: '#D6E8F5', text: '#003087' },
  en_route:   { bg: '#EDE7F6', text: '#4A148C' },
  dispatched: { bg: '#D6E8F5', text: '#003087' },
  sent:       { bg: '#D6E8F5', text: '#003087' },
  pending:    { bg: '#FFF3CD', text: '#856404' },
  unavailable:{ bg: '#F0F4F5', text: '#4C6272' },
  cancelled:  { bg: '#F0F4F5', text: '#4C6272' },
  declined:   { bg: '#F0F4F5', text: '#4C6272' },
  failed:     { bg: '#FDECEA', text: '#DA291C' },
  rejected:   { bg: '#FDECEA', text: '#DA291C' },
};

export function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: '#F0F4F5', text: '#4C6272' };
  return (
    <View style={[pill.wrap, { backgroundColor: c.bg }]}>
      <Text style={[pill.text, { color: c.text }]}>{status}</Text>
    </View>
  );
}

const pill = StyleSheet.create({
  wrap: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
});

const styles = StyleSheet.create({
  search: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.paleGrey,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.grey2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  cell: { justifyContent: 'center', paddingRight: 4 },
  cellText: { ...typography.bodySmall, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border },
  empty: { ...typography.body, color: colors.grey3, textAlign: 'center', padding: spacing.xl },
  count: { ...typography.caption, color: colors.grey3, textAlign: 'center', padding: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});

const detail = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.nhsBlue,
  },
  title: { ...typography.h3, color: colors.nhsBlue, flex: 1, marginRight: spacing.md },
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  field: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldLabel: { ...typography.caption, color: colors.grey2, fontWeight: '700', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldValue: { ...typography.body, color: colors.textPrimary },
  actions: { marginTop: spacing.xl, gap: spacing.md },
});
