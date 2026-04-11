import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoOff, Video, PhoneCall } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { supabase } from '@/services/supabase';
import { colors, radii, spacing, typography } from '@/config/theme';
import { EMERGENCY_SERVICE_NUMBER } from '@/lib/constants';
import { Linking } from 'react-native';
import { captureException } from '@/lib/sentry';

/**
 * Live witness-mode camera view.
 *
 * The real production version will pump frames to a WebRTC SFU so remote
 * dispatchers and responders can observe the scene in real time. For
 * this scaffold we:
 *   • Acquire camera permission
 *   • Mark the emergency as having an active witness stream
 *   • Show the live preview with a "streaming" indicator
 *   • Allow one-tap call to 999 during the stream
 */
export default function WitnessModeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [streaming, setStreaming] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (!id) return;
    void markStreamActive(id, true);
    return () => {
      void markStreamActive(id, false);
    };
  }, [id]);

  const handleStart = () => {
    setStreaming(true);
  };

  const handleStop = () => {
    setStreaming(false);
    router.back();
  };

  const handleCall = () => {
    Linking.openURL(`tel:${EMERGENCY_SERVICE_NUMBER}`).catch(() =>
      Alert.alert('Unable to open dialer')
    );
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera access is required to broadcast the scene to dispatchers.
        </Text>
        <Button label="Allow camera" onPress={requestPermission} size="lg" fullWidth />
        <Button label="Not now" variant="ghost" onPress={() => router.back()} fullWidth />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <View style={styles.topBar}>
        <View style={[styles.statusDot, streaming && styles.statusDotActive]} />
        <Text style={styles.statusText}>
          {streaming ? 'LIVE — Dispatch is watching' : 'Preview'}
        </Text>
      </View>

      <View style={styles.bottomControls}>
        <Button
          label={`Call ${EMERGENCY_SERVICE_NUMBER}`}
          variant="emergency"
          size="emergency"
          leftIcon={<PhoneCall size={20} color={colors.white} />}
          onPress={handleCall}
          fullWidth
        />
        {streaming ? (
          <Button
            label="Stop streaming"
            variant="outline"
            size="lg"
            leftIcon={<VideoOff size={18} color={colors.white} />}
            onPress={handleStop}
            fullWidth
          />
        ) : (
          <Button
            label="Start stream"
            variant="primary"
            size="lg"
            leftIcon={<Video size={18} color={colors.white} />}
            onPress={handleStart}
            fullWidth
          />
        )}
      </View>
    </View>
  );
}

async function markStreamActive(emergencyId: string, active: boolean) {
  try {
    await supabase
      .from('emergencies')
      .update({ witness_stream_active: active })
      .eq('id', emergencyId);
  } catch (err) {
    captureException(err, { context: 'witness-mode.markStream', active });
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  camera: { flex: 1 },
  topBar: {
    position: 'absolute',
    top: 48,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radii.pill,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.grey3,
  },
  statusDotActive: { backgroundColor: colors.emergencyRed },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 48,
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.sm,
  },
  permissionContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  permissionText: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
