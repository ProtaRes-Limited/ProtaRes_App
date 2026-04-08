import { useState, useEffect } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Navigation,
  AlertTriangle,
  Clock,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/stores/auth';
import { useEmergencyStore } from '@/stores/emergency';
import { EMERGENCY_TYPE_LABELS } from '@/lib/constants';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';

export default function MapScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const pendingAlerts = useEmergencyStore((s) => s.pendingAlerts);
  const [panelExpanded, setPanelExpanded] = useState(false);

  const userLocation = user?.currentLocation;

  return (
    <Screen padded={false} safeArea>
      <View style={styles.container}>
        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapInner}>
            <View style={styles.mapIconCircle}>
              <MapPin size={32} color="#005EB8" />
            </View>
            <Text style={styles.mapTitle}>
              Map View
            </Text>
            <Text style={styles.mapSubtitle}>
              Interactive map will display here with your location and nearby emergencies.
            </Text>
            {userLocation && (
              <View style={styles.locationBadge}>
                <Navigation size={14} color="#005EB8" />
                <Text style={styles.locationBadgeText}>
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Panel */}
        <View style={styles.bottomPanel}>
          {/* Handle */}
          <Pressable
            onPress={() => setPanelExpanded(!panelExpanded)}
            style={styles.panelHandle}
          >
            <View style={styles.handleBar} />
            <View style={styles.panelHandleRow}>
              <Text style={styles.panelTitle}>
                Nearby Emergencies ({pendingAlerts.length})
              </Text>
              {panelExpanded ? (
                <ChevronDown size={16} color="#6B7280" />
              ) : (
                <ChevronUp size={16} color="#6B7280" />
              )}
            </View>
          </Pressable>

          {/* Panel Content */}
          <View
            style={[
              styles.panelContent,
              panelExpanded ? styles.panelContentExpanded : styles.panelContentCollapsed,
            ]}
          >
            {pendingAlerts.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>
                  No emergencies nearby
                </Text>
              </View>
            ) : (
              pendingAlerts.slice(0, panelExpanded ? 10 : 2).map((alert) => (
                <Card
                  key={alert.id}
                  variant="outlined"
                  style={styles.alertCard}
                  onPress={() => router.push(`/emergency/${alert.id}`)}
                >
                  <View style={styles.alertRow}>
                    <View style={styles.alertIconCircle}>
                      <AlertTriangle size={16} color="#DA291C" />
                    </View>
                    <View style={styles.alertTextBlock}>
                      <Text
                        style={styles.alertTitleText}
                        numberOfLines={1}
                      >
                        {EMERGENCY_TYPE_LABELS[alert.emergencyType]}
                      </Text>
                      <Text
                        style={styles.alertSubtitleText}
                        numberOfLines={1}
                      >
                        {alert.locationAddress || 'Unknown location'}
                      </Text>
                    </View>
                    {alert.distanceMeters != null && (
                      <Badge variant="info">
                        {alert.distanceMeters < 1000
                          ? `${alert.distanceMeters}m`
                          : `${(alert.distanceMeters / 1000).toFixed(1)}km`}
                      </Badge>
                    )}
                  </View>
                </Card>
              ))
            )}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapInner: {
    alignItems: 'center',
    paddingHorizontal: spacing[8],
  },
  mapIconCircle: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  mapTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray[700],
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  mapSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
  },
  locationBadge: {
    marginTop: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  locationBadgeText: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
  },
  bottomPanel: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.gray[200],
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
  },
  panelHandle: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[300],
    marginBottom: spacing[2],
  },
  panelHandleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  panelTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray[700],
  },
  panelContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  panelContentExpanded: {
    maxHeight: 320,
  },
  panelContentCollapsed: {
    maxHeight: 144,
  },
  emptyRow: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  alertCard: {
    marginBottom: spacing[2],
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  alertIconCircle: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.emergency[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTextBlock: {
    flex: 1,
  },
  alertTitleText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  alertSubtitleText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
});
