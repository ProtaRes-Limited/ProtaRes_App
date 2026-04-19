import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Phone, MessageSquare, Shield, Heart, ExternalLink, MapPin } from 'lucide-react-native';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { useLocationStore } from '@/stores/location';
import {
  buildContactProfile,
  callEmergency,
  callPoliceNonEmergency,
  callNhsNonEmergency,
  smsEmergency,
  openForceWebsite,
  openTrustWebsite,
  type EmergencyContactProfile,
} from '@/services/emergencyServices';
import { colors, radii, spacing, typography } from '@/config/theme';

/**
 * Tier 1 of the emergency-services feature set.
 *
 * Shows four universal UK emergency contact buttons plus district-aware
 * information (local police force + ambulance trust) derived from the user's
 * current GPS position via data.police.uk + postcodes.io.
 *
 * The four calling options ALWAYS work, even if the lookups fail — they use
 * native tel:/sms: URLs which the telecom network routes automatically.
 * The district information is purely for display and deep-linking.
 */
export default function EmergencyContactScreen() {
  const coords = useLocationStore((s) => s.current);
  const [profile, setProfile] = useState<EmergencyContactProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    buildContactProfile(coords).then((p) => {
      if (!cancelled) {
        setProfile(p);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [coords?.latitude, coords?.longitude]);

  return (
    <Screen padded={false}>
      <Header title="Emergency contacts" showBack />

      <ScrollView contentContainerStyle={styles.body}>
        {/* Primary 999 button — always visible, always first */}
        <TouchableOpacity
          onPress={callEmergency}
          activeOpacity={0.85}
          accessibilityLabel="Call 999 — emergency services"
          accessibilityHint="Connects you to police, ambulance, or fire"
        >
          <Card elevated style={[styles.callCard, styles.cardEmergency]}>
            <View style={styles.callIcon}>
              <Phone size={28} color={colors.white} />
            </View>
            <View style={styles.callBody}>
              <Text style={styles.callTitleOnDark}>999</Text>
              <Text style={styles.callSubtitleOnDark}>
                Emergency — police, ambulance, fire
              </Text>
            </View>
          </Card>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.flex}
            onPress={callPoliceNonEmergency}
            activeOpacity={0.85}
            accessibilityLabel="Call 101 — non-emergency police"
          >
            <Card elevated style={styles.callCardSecondary}>
              <Shield size={24} color={colors.nhsBlue} />
              <Text style={styles.callTitle}>101</Text>
              <Text style={styles.callSubtitle}>Non-emergency police</Text>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flex}
            onPress={callNhsNonEmergency}
            activeOpacity={0.85}
            accessibilityLabel="Call 111 — NHS non-emergency"
          >
            <Card elevated style={styles.callCardSecondary}>
              <Heart size={24} color={colors.nhsBlue} />
              <Text style={styles.callTitle}>111</Text>
              <Text style={styles.callSubtitle}>NHS non-emergency</Text>
            </Card>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => smsEmergency()}
          activeOpacity={0.85}
          accessibilityLabel="Text 999 — emergency SMS service"
        >
          <Card style={styles.smsCard}>
            <MessageSquare size={22} color={colors.nhsBlue} />
            <View style={styles.smsBody}>
              <Text style={styles.smsTitle}>Text 999</Text>
              <Text style={styles.smsSubtitle}>
                For deaf / hard-of-hearing users. Register once by texting REGISTER to 999.
              </Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Location-aware district block */}
        <View style={styles.districtHeader}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={styles.districtHeaderText}>
            {coords
              ? profile?.postcode
                ? `Your area: ${profile.postcode}`
                : 'Your area'
              : 'Location unavailable — general contacts shown above'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={colors.nhsBlue} />
            <Text style={styles.loadingText}>Looking up local services…</Text>
          </View>
        ) : (
          <>
            {profile?.policeForce ? (
              <Card style={styles.districtCard}>
                <Text style={styles.districtLabel}>Your local police force</Text>
                <Text style={styles.districtName}>{profile.policeForce.name}</Text>
                {profile.policeForce.description ? (
                  <Text style={styles.districtDescription} numberOfLines={3}>
                    {profile.policeForce.description.replace(/<[^>]+>/g, '')}
                  </Text>
                ) : null}
                <View style={styles.districtActions}>
                  {profile.policeForce.telephone ? (
                    <TouchableOpacity
                      style={styles.districtButton}
                      onPress={() =>
                        Linking.openURL(`tel:${profile.policeForce!.telephone}`).catch(() => {})
                      }
                    >
                      <Phone size={16} color={colors.nhsBlue} />
                      <Text style={styles.districtButtonText}>
                        {profile.policeForce.telephone}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  {profile.policeForce.url ? (
                    <TouchableOpacity
                      style={styles.districtButton}
                      onPress={() => openForceWebsite(profile.policeForce!)}
                    >
                      <ExternalLink size={16} color={colors.nhsBlue} />
                      <Text style={styles.districtButtonText}>Website</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </Card>
            ) : null}

            {profile?.ambulanceTrust ? (
              <Card style={styles.districtCard}>
                <Text style={styles.districtLabel}>Your ambulance trust</Text>
                <Text style={styles.districtName}>{profile.ambulanceTrust.name}</Text>
                <View style={styles.districtActions}>
                  <TouchableOpacity
                    style={styles.districtButton}
                    onPress={() => openTrustWebsite(profile.ambulanceTrust!)}
                  >
                    <ExternalLink size={16} color={colors.nhsBlue} />
                    <Text style={styles.districtButtonText}>Website</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ) : null}
          </>
        )}

        <Text style={styles.disclaimer}>
          ProtaRes supplements — never replaces — emergency services. Always call 999 for
          anything life-threatening.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },

  callCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardEmergency: {
    backgroundColor: colors.errorRed,
    borderColor: colors.errorRed,
  },
  callIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBody: { flex: 1 },
  callTitleOnDark: { ...typography.h1, color: colors.white, fontWeight: '700' },
  callSubtitleOnDark: { ...typography.bodySmall, color: colors.white, opacity: 0.9 },

  callCardSecondary: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  callTitle: { ...typography.h2, color: colors.textPrimary, fontWeight: '700' },
  callSubtitle: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },

  smsCard: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  smsBody: { flex: 1 },
  smsTitle: { ...typography.h3, color: colors.textPrimary },
  smsSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  districtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  districtHeaderText: { ...typography.caption, color: colors.textSecondary },

  districtCard: { padding: spacing.lg, gap: spacing.sm },
  districtLabel: { ...typography.caption, color: colors.textSecondary },
  districtName: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  districtDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  districtActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  districtButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    backgroundColor: colors.paleGrey,
  },
  districtButtonText: { ...typography.caption, color: colors.nhsBlue, fontWeight: '600' },

  loadingBlock: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: { ...typography.bodySmall, color: colors.textSecondary },

  disclaimer: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
});
