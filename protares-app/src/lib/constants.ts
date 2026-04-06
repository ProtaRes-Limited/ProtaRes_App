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

export const EMERGENCY_TYPE_ICONS: Record<EmergencyType, string> = {
  cardiac_arrest: 'Heart',
  heart_attack: 'Heart',
  road_accident: 'Car',
  pedestrian_incident: 'PersonStanding',
  cyclist_incident: 'Bike',
  stroke: 'Brain',
  diabetic_emergency: 'Syringe',
  anaphylaxis: 'AlertTriangle',
  seizure: 'Zap',
  breathing_difficulty: 'Wind',
  stabbing: 'AlertTriangle',
  assault: 'AlertTriangle',
  serious_fall: 'TrendingDown',
  choking: 'AlertTriangle',
  drowning: 'Waves',
  burn: 'Flame',
  electrocution: 'Zap',
  overdose: 'Pill',
  other_medical: 'Stethoscope',
  other_trauma: 'AlertTriangle',
};

export const TIER_LABELS: Record<ResponderTier, string> = {
  tier1_active_healthcare: 'Active Healthcare',
  tier2_retired_healthcare: 'Retired Healthcare',
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
export const LOCATION_UPDATE_INTERVAL_MS = 5000;
export const LOCATION_RETENTION_HOURS = 24;
export const MAX_ALERT_RADIUS_KM = 20;
export const DEFAULT_ALERT_RADIUS_KM = 5;
