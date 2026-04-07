import { supabase } from './supabase';
import type {
  Emergency,
  EmergencyType,
  Coordinates,
  ResponseStatus,
} from '@/types';

export const emergencyService = {
  async getNearbyEmergencies(location: Coordinates, radiusKm: number = 10) {
    const { data, error } = await supabase.rpc('find_nearby_emergencies', {
      lat: location.latitude,
      lng: location.longitude,
      radius_km: radiusKm,
    });

    if (error) throw error;
    return (data as Record<string, unknown>[]).map(transformEmergency);
  },

  async getEmergency(id: string): Promise<Emergency> {
    const { data, error } = await supabase
      .from('emergencies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformEmergency(data as Record<string, unknown>);
  },

  async reportEmergency(report: {
    emergencyType: EmergencyType;
    location: Coordinates;
    description?: string;
    casualtyCount?: number;
  }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('emergencies')
      .insert({
        emergency_type: report.emergencyType,
        location: `POINT(${report.location.longitude} ${report.location.latitude})`,
        description: report.description,
        casualty_count: report.casualtyCount || 1,
        reported_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return transformEmergency(data as Record<string, unknown>);
  },

  async acceptEmergency(emergencyId: string, etaSeconds: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('responses')
      .insert({
        emergency_id: emergencyId,
        responder_id: user.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        estimated_eta_seconds: etaSeconds,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async declineEmergency(emergencyId: string, reason?: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('responses').insert({
      emergency_id: emergencyId,
      responder_id: user.id,
      status: 'declined',
      declined_at: new Date().toISOString(),
      decline_reason: reason,
    });

    if (error) throw error;
  },

  async updateResponseStatus(
    responseId: string,
    status: ResponseStatus,
    additionalData?: Record<string, unknown>
  ) {
    const { error } = await supabase
      .from('responses')
      .update({
        status,
        ...additionalData,
      })
      .eq('id', responseId);

    if (error) throw error;
  },

  async getResponseHistory() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('responses')
      .select('*, emergencies(*)')
      .eq('responder_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  subscribeToEmergency(
    emergencyId: string,
    callback: (emergency: Emergency) => void
  ) {
    return supabase
      .channel(`emergency:${emergencyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergencies',
          filter: `id=eq.${emergencyId}`,
        },
        (payload) => {
          callback(
            transformEmergency(payload.new as Record<string, unknown>)
          );
        }
      )
      .subscribe();
  },
};

function transformEmergency(row: Record<string, unknown>): Emergency {
  const r = row as Record<string, any>;
  return {
    id: r.id,
    emergencyType: r.emergency_type,
    severity: r.severity,
    status: r.status,
    location: r.location?.coordinates
      ? {
          latitude: r.location.coordinates[1],
          longitude: r.location.coordinates[0],
        }
      : { latitude: r.latitude ?? 0, longitude: r.longitude ?? 0 },
    locationAddress: r.location_address,
    locationDescription: r.location_description,
    what3words: r.what3words,
    reportedBy: r.reported_by,
    reporterPhone: r.reporter_phone,
    reporterName: r.reporter_name,
    description: r.description,
    casualtyCount: r.casualty_count ?? 1,
    casualtiesConscious: r.casualties_conscious,
    casualtiesBreathing: r.casualties_breathing,
    witnessStreamActive: r.witness_stream_active ?? false,
    witnessStreamUrl: r.witness_stream_url,
    equipmentRequested: r.equipment_requested ?? [],
    equipmentDelivered: r.equipment_delivered ?? [],
    ambulanceNotified: r.ambulance_notified ?? false,
    ambulanceNotifiedAt: r.ambulance_notified_at,
    ambulanceEtaMinutes: r.ambulance_eta_minutes,
    policeNotified: r.police_notified ?? false,
    fireNotified: r.fire_notified ?? false,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    resolvedAt: r.resolved_at,
    distanceMeters: r.distance_meters,
    etaMinutes: r.eta_minutes,
  };
}
