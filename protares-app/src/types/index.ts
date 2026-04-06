export type ResponderTier =
  | 'tier1_active_healthcare'
  | 'tier2_retired_healthcare'
  | 'tier3_first_aid'
  | 'tier4_witness';

export type AvailabilityStatus =
  | 'available'
  | 'busy'
  | 'unavailable'
  | 'do_not_disturb';

export type EmergencyType =
  | 'cardiac_arrest'
  | 'heart_attack'
  | 'road_accident'
  | 'pedestrian_incident'
  | 'cyclist_incident'
  | 'stroke'
  | 'diabetic_emergency'
  | 'anaphylaxis'
  | 'seizure'
  | 'breathing_difficulty'
  | 'stabbing'
  | 'assault'
  | 'serious_fall'
  | 'choking'
  | 'drowning'
  | 'burn'
  | 'electrocution'
  | 'overdose'
  | 'other_medical'
  | 'other_trauma';

export type EmergencySeverity = 'critical' | 'serious' | 'moderate' | 'minor';

export type EmergencyStatus =
  | 'reported'
  | 'dispatched'
  | 'responder_en_route'
  | 'responder_on_scene'
  | 'ems_en_route'
  | 'ems_on_scene'
  | 'handover_complete'
  | 'resolved'
  | 'cancelled'
  | 'no_response';

export type ResponseStatus =
  | 'alerted'
  | 'accepted'
  | 'declined'
  | 'en_route'
  | 'on_scene'
  | 'intervening'
  | 'completing'
  | 'completed'
  | 'withdrawn';

export type TransportMode =
  | 'stationary'
  | 'walking'
  | 'cycling'
  | 'bus'
  | 'train'
  | 'driving'
  | 'unknown';

export type EquipmentType =
  | 'aed'
  | 'trauma_kit'
  | 'burn_kit'
  | 'naloxone_kit'
  | 'obstetric_kit'
  | 'basic_medical_kit'
  | 'oxygen'
  | 'cutting_gear';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Responder {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePhotoUrl: string | null;
  tier: ResponderTier;
  availability: AvailabilityStatus;
  currentLocation: Coordinates | null;
  currentTransportMode: TransportMode;
  locationUpdatedAt: string | null;
  alertRadiusKm: number;
  smsFallbackEnabled: boolean;
  pushEnabled: boolean;
  totalResponses: number;
  totalAccepted: number;
  totalDeclined: number;
  averageResponseTimeSeconds: number | null;
  locationConsent: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string | null;
}

export interface Credential {
  id: string;
  responderId: string;
  credentialType: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired' | 'revoked';
  verifiedAt: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface Emergency {
  id: string;
  emergencyType: EmergencyType;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  location: Coordinates;
  locationAddress: string | null;
  locationDescription: string | null;
  what3words: string | null;
  reportedBy: string | null;
  reporterPhone: string | null;
  reporterName: string | null;
  description: string | null;
  casualtyCount: number;
  casualtiesConscious: boolean | null;
  casualtiesBreathing: boolean | null;
  witnessStreamActive: boolean;
  witnessStreamUrl: string | null;
  equipmentRequested: EquipmentType[];
  equipmentDelivered: EquipmentType[];
  ambulanceNotified: boolean;
  ambulanceNotifiedAt: string | null;
  ambulanceEtaMinutes: number | null;
  policeNotified: boolean;
  fireNotified: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  distanceMeters?: number;
  etaMinutes?: number;
}

export interface EmergencyResponse {
  id: string;
  emergencyId: string;
  responderId: string;
  alertedAt: string;
  alertMethod: 'push' | 'sms' | 'both';
  estimatedEtaSeconds: number | null;
  status: ResponseStatus;
  acceptedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  departedAt: string | null;
  arrivedAt: string | null;
  transportMode: TransportMode | null;
  interventionsPerformed: string[];
  equipmentUsed: EquipmentType[];
  notes: string | null;
  handoverAt: string | null;
  handoverTo: string | null;
  completedAt: string | null;
  feedbackRating: number | null;
  feedbackNotes: string | null;
  emergency?: Emergency;
  responder?: Responder;
}

export interface EquipmentLocation {
  id: string;
  equipmentType: EquipmentType;
  name: string | null;
  description: string | null;
  location: Coordinates;
  locationAddress: string | null;
  locationDetails: string | null;
  isAvailable: boolean;
  availableHours: string | null;
  accessInstructions: string | null;
  distanceMeters?: number;
}

export interface GreenBadge {
  responderId: string;
  name: string;
  tier: ResponderTier;
  credentialType: string | null;
  verified: boolean;
  issuedAt: string;
  expiresAt: string;
  qrData: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
