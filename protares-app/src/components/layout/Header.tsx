import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { colors, spacing, touchTargets, typography } from '@/config/theme';

interface Props {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  subtitle?: string;
}

export function Header({ title, showBack = false, rightAction, subtitle }: Props) {
  const router = useRouter();
  return (
    <View style={styles.container} accessibilityRole="header">
      <View style={styles.sideSlot}>
        {showBack && router.canGoBack() ? (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={colors.nhsBlue} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.sideSlot}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sideSlot: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: touchTargets.recommended,
    height: touchTargets.recommended,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { flex: 1, alignItems: 'center' },
  title: { ...typography.h3, color: colors.textPrimary },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
