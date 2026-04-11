import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { useLocationStore } from '@/stores/location';
import { useActiveEmergencies } from '@/hooks/useEmergencies';
import { colors, spacing, typography } from '@/config/theme';

const LONDON_FALLBACK = { latitude: 51.5074, longitude: -0.1278 };

export default function MapScreen() {
  const current = useLocationStore((s) => s.current);
  const { data } = useActiveEmergencies();

  const initialRegion = {
    latitude: current?.latitude ?? LONDON_FALLBACK.latitude,
    longitude: current?.longitude ?? LONDON_FALLBACK.longitude,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  return (
    <Screen padded={false} edges={['top']}>
      <Header title="Map" />
      <View style={styles.mapWrap}>
        <MapView
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
          showsCompass
          accessibilityLabel="Map of active emergencies"
        >
          {(data ?? []).map((emergency) => (
            <Marker
              key={emergency.id}
              coordinate={emergency.location}
              title={emergency.emergencyType.replace(/_/g, ' ')}
              description={emergency.locationAddress ?? ''}
              pinColor={colors.emergencyRed}
            />
          ))}
        </MapView>
        {!current ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Enable location to see your position on the map.
            </Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapWrap: { flex: 1 },
  map: { flex: 1 },
  banner: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.nhsBlue,
    padding: spacing.md,
    borderRadius: 8,
  },
  bannerText: {
    ...typography.bodySmall,
    color: colors.white,
  },
});
