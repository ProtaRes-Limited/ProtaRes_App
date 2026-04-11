import { supabase } from './supabase';
import { useAuthStore } from '@/stores/auth';
import { haversineDistance } from '@/lib/distance';
import type {
  Coordinates,
  Emergency,
  EmergencySeverity,
  EmergencyStatus,
  EmergencyType,
} from '@/types';

function currentUserId(): string {
  const session = useAuthStore.getState().session;
  if (!session?.user?.id) throw new Error('Not authenticated');
  return session.user.id;
}

function rowToEmergency(row: Record<string, unknown>, reference?: Coordinates | null): Emergency {
  const location = extractCoords(row.location) ?? { latitude: 0, longitude: 0 };
  const distanceMeters = reference ? haversineDistance(reference, location) : null;
  return {
    id: String(row.id),
    emergencyType: row.emergency_type as EmergencyType,
    severity: row.severity as EmergencySeverity,
    status: row.status as EmergencyStatus,
    location,
    locationAddress: (row.location_address as string | null) ?? null,
    locationDescription: (row.location_description as string | null) ?? null,
    what3words: (row.what3words as string | null) ?? null,
    reportedBy: (row.reported_by as string | null) ?? null,
    reporterPhone: (row.reporter_phone as string | null) ?? null,
    reporterName: (row.reporter_name as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    casualtyCount: (row.casualty_count as number) ?? 1,
    casualtiesConscious: (row.casualties_conscious as boolean | null) ?? null,
    casualtiesBreathing: (row.casualties_breathing as boolean | null) ?? null,
    witnessStreamActive: Boolean(row.witness_stream_active),
    witnessStreamUrl: (row.witness_stream_url as string | null) ?? null,
    equipmentRequested: (row.equipment_requested as string[]) ?? [],
    equipmentDelivered: (row.equipment_delivered as string[]) ?? [],
    ambulanceNotified: Boolean(row.ambulance_notified),
    ambulanceNotifiedAt: (row.ambulance_notified_at as string | null) ?? null,
    ambulanceEtaMinutes: (row.ambulance_eta_minutes as number | null) ?? null,
    policeNotified: Boolean(row.police_notified),
    fireNotified: Boolean(row.fire_notified),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    resolvedAt: (row.resolved_at as string | null) ?? null,
    distanceMeters,
    etaMinutes: null,
  };
}

function extractCoords(value: unknown): Coordinates | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (v.type === 'Point' && Array.isArray(v.coordinates) && v.coordinates.length >= 2) {
    const [lng, lat] = v.coordinates;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return { latitude: lat, longitude: lng };
    }
  }
  return null;
}

export async function listActiveEmergencies(reference?: Coordinates | null) {
  const { data, error } = await supabase
    .from('emergencies')
    .select('*')
    .not('status', 'in', '("resolved","cancelled")')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((row) => rowToEmergency(row, reference));
}

export async function getEmergency(id: string, reference?: Coordinates | null) {
  const { data, error } = await supabase
    .from('emergencies')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToEmergency(data, reference);
}

/**
 * Response mutations target the `responses` table (not "emergency_responders")
 * and use the `response_status` enum values: alerted / accepted / declined /
 * en_route / on_scene / intervening / completing / completed / withdrawn.
 */

export async function acceptEmergency(emergencyId: string) {
  const { error } = await supabase.from('responses').upsert(
    {
      emergency_id: emergencyId,
      responder_id: currentUserId(),
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    },
    { onConflict: 'emergency_id,responder_id' }
  );
  if (error) throw error;
}

export async function declineEmergency(emergencyId: string, reason?: string) {
  const { error } = await supabase.from('responses').upsert(
    {
      emergency_id: emergencyId,
      responder_id: currentUserId(),
      status: 'declined',
      declined_at: new Date().toISOString(),
      decline_reason: reason ?? null,
    },
    { onConflict: 'emergency_id,responder_id' }
  );
  if (error) throw error;
}

export async function updateEmergencyStatus(
  emergencyId: string,
  status: EmergencyStatus
) {
  const { error } = await supabase
    .from('emergencies')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', emergencyId);
  if (error) throw error;
}

export async function markEnRoute(emergencyId: string) {
  const { error } = await supabase
    .from('responses')
    .update({ status: 'en_route', departed_at: new Date().toISOString() })
    .eq('emergency_id', emergencyId)
    .eq('responder_id', currentUserId());
  if (error) throw error;
  await updateEmergencyStatus(emergencyId, 'responder_en_route');
}

export async function markOnScene(emergencyId: string) {
  const { error } = await supabase
    .from('responses')
    .update({ status: 'on_scene', arrived_at: new Date().toISOString() })
    .eq('emergency_id', emergencyId)
    .eq('responder_id', currentUserId());
  if (error) throw error;
  await updateEmergencyStatus(emergencyId, 'responder_on_scene');
}

export async function markHandover(emergencyId: string, handoverTo?: string) {
  const { error } = await supabase
    .from('responses')
    .update({
      status: 'completed',
      handover_at: new Date().toISOString(),
      handover_to: handoverTo ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq('emergency_id', emergencyId)
    .eq('responder_id', currentUserId());
  if (error) throw error;
  await updateEmergencyStatus(emergencyId, 'handover_complete');
}

export async function reportEmergency(params: {
  emergencyType: EmergencyType;
  severity: EmergencySeverity;
  location: Coordinates;
  description?: string;
  casualtyCount?: number;
  casualtiesConscious?: boolean | null;
  casualtiesBreathing?: boolean | null;
  locationDescription?: string;
}) {
  const { error, data } = await supabase
    .from('emergencies')
    .insert({
      emergency_type: params.emergencyType,
      severity: params.severity,
      status: 'reported',
      location: `POINT(${params.location.longitude} ${params.location.latitude})`,
      location_description: params.locationDescription,
      description: params.description,
      casualty_count: params.casualtyCount ?? 1,
      casualties_conscious: params.casualtiesConscious ?? null,
      casualties_breathing: params.casualtiesBreathing ?? null,
      reported_by: currentUserId(),
    })
    .select()
    .single();
  if (error) throw error;

  // Fire-and-forget the dispatch function so nearby responders get alerted.
  supabase.functions
    .invoke('dispatch-alert', { body: { emergencyId: data.id } })
    .catch(() => {
      // Dispatch is also triggered by a DB trigger — Edge invocation is
      // only a performance optimisation.
    });

  return data.id as string;
}
