import { supabase } from './supabase';
import type { Emergency, EmergencyType, Coordinates, ResponseStatus } from '@/types';

function transformEmergency(row: Record<string, unknown>): Emergency {
  const location = row.location as { coordinates?: number[] } | null;
  return {
    id: row.id as string,
    emergencyType: row.emergency_type as EmergencyType,
    severity: row.severity as Emergency['severity'],
    status: row.status as Emergency['status'],
    location: location?.coordinates
      ? { latitude: location.coordinates[1], longitude: location.coordinates[0] }
      : { latitude: 0, longitude: 0 },
    locationAddress: (row.location_address as string) || null,
    locationDescription: (row.location_description as string) || null,
    what3words: (row.what3words as string) || null,
    reportedBy: (row.reported_by as string) || null,
    reporterPhone: (row.reporter_phone as string) || null,
    reporterName: (row.reporter_name as string) || null,
    description: (row.description as string) || null,
    casualtyCount: (row.casualty_count as number) || 1,
    casualtiesConscious: (row.casualties_conscious as boolean) ?? null,
    casualtiesBreathing: (row.casualties_breathing as boolean) ?? null,
    witnessStreamActive: (row.witness_stream_active as boolean) || false,
    witnessStreamUrl: (row.witness_stream_url as string) || null,
    equipmentRequested: (row.equipment_requested as Emergency['equipmentRequested']) || [],
    equipmentDelivered: (row.equipment_delivered as Emergency['equipmentDelivered']) || [],
    ambulanceNotified: (row.ambulance_notified as boolean) || false,
    ambulanceNotifiedAt: (row.ambulance_notified_at as string) || null,
    ambulanceEtaMinutes: (row.ambulance_eta_minutes as number) || null,
    policeNotified: (row.police_notified as boolean) || false,
    fireNotified: (row.fire_notified as boolean) || false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    resolvedAt: (row.resolved_at as string) || null,
  };
}

export const emergencyService = {
  async getNearbyEmergencies(_location: Coordinates, _radiusKm: number = 10) {
    const { data, error } = await supabase
      .from('emergencies')
      .select('*')
      .not('status', 'in', '("resolved","cancelled")')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return (data || []).map(transformEmergency);
  },

  async getEmergency(id: string): Promise<Emergency> {
    const { data, error } = await supabase
      .from('emergencies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformEmergency(data);
  },

  async reportEmergency(report: {
    emergencyType: EmergencyType;
    location: Coordinates;
    description?: string;
    casualtyCount?: number;
    locationDescription?: string;
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
        location_description: report.locationDescription,
        casualty_count: report.casualtyCount || 1,
        reported_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return transformEmergency(data);
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
      .update({ status, ...additionalData })
      .eq('id', responseId);

    if (error) throw error;
  },

  async getResponseHistory(limit: number = 20) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('responses')
      .select('*, emergencies(*)')
      .eq('responder_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  subscribeToEmergency(emergencyId: string, callback: (emergency: Emergency) => void) {
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
          callback(transformEmergency(payload.new as Record<string, unknown>));
        }
      )
      .subscribe();
  },
};
