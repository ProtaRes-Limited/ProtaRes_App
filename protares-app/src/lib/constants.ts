import type { EmergencyType, ResponderTier } from '@/types';

export const EMERGENCY_TYPE_LABELS: Record<EmergencyType, string> = {
  cardiac_arrest: 'Cardiac Arrest',
  heart_attack: 'Heart Attack',
  road_accident: 'Road Accident',
  pedestrian_incident: 'Pedestrian Incident',
  cyclist_incident: 'Cyclist Incident',
  stroke: 'Stroke',
  diabetic_emergency: 'Diabetic Emergency',
  anaphylaxis: 'Anaphylaxis',
  seizure: 'Seizure',
  breathing_difficulty: 'Breathing Difficulty',
  stabbing: 'Stabbing',
  assault: 'Assault',
  serious_fall: 'Serious Fall',
  choking: 'Choking',
  drowning: 'Drowning',
  burn: 'Burn',
  electrocution: 'Electrocution',
  overdose: 'Overdose',
  other_medical: 'Other Medical',
  other_trauma: 'Other Trauma',
};

export const TIER_LABELS: Record<ResponderTier, string> = {
  tier1_active_healthcare: 'Active Healthcare Professional',
  tier2_retired_healthcare: 'Retired Healthcare Professional',
  tier3_first_aid: 'First Aid Trained',
  tier4_witness: 'Community Witness',
};

export const TIER_COLORS: Record<ResponderTier, string> = {
  tier1_active_healthcare: '#009639',
  tier2_retired_healthcare: '#7B2D8E',
  tier3_first_aid: '#F5A623',
  tier4_witness: '#005EB8',
};

export const ALERT_TIMEOUT_SECONDS = 60;

export const MAX_ALERT_RADIUS_KM = 20;

export const MIN_ALERT_RADIUS_KM = 1;

export const DEFAULT_ALERT_RADIUS_KM = 5;

export const LOCATION_UPDATE_INTERVAL_MS = 5000;

export const LOCATION_STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export const EMERGENCY_REFRESH_INTERVAL_MS = 30000; // 30 seconds
