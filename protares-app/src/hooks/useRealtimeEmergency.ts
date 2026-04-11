import { useEffect } from 'react';

import { supabase } from '@/services/supabase';
import { useEmergencyStore } from '@/stores/emergency';
import { useAuthStore } from '@/stores/auth';
import { captureException } from '@/lib/sentry';
import type { Emergency } from '@/types';

/**
 * Subscribes to `emergencies` postgres changes so the UI receives new
 * incidents and status updates in real time. This is what makes the
 * alerts tab feel alive and is the mechanism behind the push-to-tap
 * flow: a dispatched emergency triggers an FCM push, the user opens
 * the app, the realtime channel already has the latest status.
 */
export function useRealtimeEmergency() {
  const session = useAuthStore((s) => s.session);
  const addPendingAlert = useEmergencyStore((s) => s.addPendingAlert);
  const updateEmergency = useEmergencyStore((s) => s.updateEmergency);

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('emergencies-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergencies' },
        (payload) => {
          try {
            const emergency = rowToEmergency(payload.new);
            if (emergency) addPendingAlert(emergency);
          } catch (err) {
            captureException(err, { context: 'realtime.INSERT' });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'emergencies' },
        (payload) => {
          try {
            const update = rowToEmergency(payload.new);
            if (update) updateEmergency(update);
          } catch (err) {
            captureException(err, { context: 'realtime.UPDATE' });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, addPendingAlert, updateEmergency]);
}

function rowToEmergency(row: unknown): Emergency | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const loc = r.location as { coordinates?: [number, number] } | null;
  if (!loc?.coordinates) return null;
  return {
    id: String(r.id),
    emergencyType: String(r.emergency_type) as Emergency['emergencyType'],
    severity: r.severity as Emergency['severity'],
    status: r.status as Emergency['status'],
    location: { latitude: loc.coordinates[1], longitude: loc.coordinates[0] },
    locationAddress: (r.location_address as string | null) ?? null,
    locationDescription: (r.location_description as string | null) ?? null,
    what3words: (r.what3words as string | null) ?? null,
    reportedBy: (r.reported_by as string | null) ?? null,
    reporterPhone: (r.reporter_phone as string | null) ?? null,
    reporterName: (r.reporter_name as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    casualtyCount: (r.casualty_count as number) ?? 1,
    casualtiesConscious: (r.casualties_conscious as boolean | null) ?? null,
    casualtiesBreathing: (r.casualties_breathing as boolean | null) ?? null,
    witnessStreamActive: Boolean(r.witness_stream_active),
    witnessStreamUrl: (r.witness_stream_url as string | null) ?? null,
    equipmentRequested: (r.equipment_requested as string[]) ?? [],
    equipmentDelivered: (r.equipment_delivered as string[]) ?? [],
    ambulanceNotified: Boolean(r.ambulance_notified),
    ambulanceNotifiedAt: (r.ambulance_notified_at as string | null) ?? null,
    ambulanceEtaMinutes: (r.ambulance_eta_minutes as number | null) ?? null,
    policeNotified: Boolean(r.police_notified),
    fireNotified: Boolean(r.fire_notified),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
    resolvedAt: (r.resolved_at as string | null) ?? null,
    distanceMeters: null,
    etaMinutes: null,
  };
}
