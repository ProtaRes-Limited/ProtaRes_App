// @ts-nocheck — Deno runtime
// deno-lint-ignore-file

/**
 * CAD Payload Normaliser.
 *
 * Translates inbound CAD (Computer Aided Dispatch) webhook payloads from
 * NHS Ambulance Trust systems into the ProtaRes emergency schema.
 *
 * Supported input formats:
 *   1. ProtaRes Generic — the documented format ProtaRes gives to Trust
 *      integration partners. Accepts AMPDS codes OR our enum names directly.
 *   2. What3Words shorthand — minimal payload with a W3W address; designed
 *      for the What3Words Emergency Services integration programme.
 *
 * AMPDS (Advanced Medical Priority Dispatch System) codes are the universal
 * coding system used by all UK 999 call-takers. Every incident gets a code
 * like "09E01" (Cardiac Arrest, Pulseless/Non-Breathing). The chief complaint
 * number (09 = Cardiac/Respiratory Arrest) maps to our emergency_type; the
 * determinant letter (E = Echo, life-threatening) maps to severity.
 *
 * Reference: https://www.prioritydispatch.net/ampds-codes
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type EmergencyType =
  | 'cardiac_arrest' | 'heart_attack' | 'road_accident' | 'pedestrian_incident'
  | 'cyclist_incident' | 'stroke' | 'diabetic_emergency' | 'anaphylaxis'
  | 'seizure' | 'breathing_difficulty' | 'stabbing' | 'assault' | 'serious_fall'
  | 'choking' | 'drowning' | 'burn' | 'electrocution' | 'overdose'
  | 'other_medical' | 'other_trauma';

export type EmergencySeverity = 'critical' | 'serious' | 'moderate' | 'minor';

export interface NormalisedEmergency {
  cadIncidentRef: string;
  emergencyType: EmergencyType;
  severity: EmergencySeverity;
  latitude: number;
  longitude: number;
  locationAddress: string | null;
  locationDescription: string | null;
  what3words: string | null;
  reporterPhone: string | null;
  reporterName: string | null;
  description: string | null;
  casualtyCount: number;
  casualtiesConscious: boolean | null;
  casualtiesBreathing: boolean | null;
  ambulanceNotified: boolean;
  ambulanceEtaMinutes: number | null;
}

// ─── AMPDS Chief Complaint → EmergencyType ───────────────────────────────────
//
// AMPDS codes are structured as: <CC><Determinant><Suffix>
// e.g. "09E01": CC=09 (Cardiac/Resp Arrest), Det=E (Echo/Immediately Life-Threatening)
// We map the chief complaint number (CC) to our type enum.
//
// Full AMPDS CC list: https://www.prioritydispatch.net/medical-priority-dispatch-system/

const AMPDS_CC_MAP: Record<string, EmergencyType> = {
  '01': 'other_medical',         // Abdominal Pain / Problems
  '02': 'other_medical',         // Allergic Reaction / Envenomation
  '03': 'other_medical',         // Animal Bites / Attacks
  '04': 'assault',               // Assault / Sexual Assault / Stab Wound
  '05': 'other_medical',         // Back Pain
  '06': 'breathing_difficulty',  // Breathing Problems
  '07': 'burn',                  // Burns / Explosions
  '08': 'choking',               // Choking
  '09': 'cardiac_arrest',        // Cardiac / Respiratory Arrest
  '10': 'other_medical',         // Chest Pain (Non-Traumatic)
  '11': 'choking',               // Choking (duplicate path)
  '12': 'seizure',               // Convulsions / Fitting
  '13': 'diabetic_emergency',    // Diabetic Problems
  '14': 'other_medical',         // Drowning / Diving / SCUBA Accident
  '15': 'electrocution',         // Electrocution / Lightning
  '16': 'other_medical',         // Eye Problems / Injuries
  '17': 'serious_fall',          // Falls
  '18': 'other_medical',         // Headache
  '19': 'heart_attack',          // Heart Problems / A.I.C.D.
  '20': 'overdose',              // Heat / Cold Exposure
  '21': 'overdose',              // Haemorrhage / Lacerations
  '22': 'other_medical',         // Inaccessible Incident / Other Entrapments
  '23': 'overdose',              // Overdose / Poisoning (Ingestion)
  '24': 'other_medical',         // Pregnancy / Childbirth / Miscarriage
  '25': 'other_medical',         // Psychiatric / Abnormal Behaviour
  '26': 'serious_fall',          // Sick Person (Specific Diagnosis)
  '27': 'stabbing',              // Stab / Gunshot / Penetrating Trauma
  '28': 'stroke',                // Stroke / CVA / TIA
  '29': 'road_accident',         // Traffic / Transportation Incidents
  '30': 'other_trauma',          // Traumatic Injuries (Specific)
  '31': 'other_medical',         // Unconscious / Fainting (Near)
  '32': 'other_medical',         // Unknown Problem (Man Down)
  '33': 'assault',               // Transfer / Interfacility / Palliative Care
  '36': 'anaphylaxis',           // Pandemic / Epidemic / Outbreak
  '37': 'serious_fall',          // Inter-facility Transfer
};

// AMPDS Determinant letters → severity
const AMPDS_DETERMINANT_MAP: Record<string, EmergencySeverity> = {
  'E': 'critical',   // Echo — Immediately Life-Threatening
  'D': 'critical',   // Delta — Life-Threatening
  'C': 'serious',    // Charlie — Potentially Life-Threatening
  'B': 'serious',    // Bravo — Serious
  'A': 'moderate',   // Alpha — Non-Life-Threatening
  'O': 'minor',      // Omega — Non-Emergency
};

// UK ambulance priority names → severity
const PRIORITY_LABEL_MAP: Record<string, EmergencySeverity> = {
  'RED':      'critical',
  'PURPLE':   'critical',  // cardiac arrest
  'ECHO':     'critical',
  'DELTA':    'critical',
  'CHARLIE':  'serious',
  'BRAVO':    'serious',
  'ALPHA':    'moderate',
  'OMEGA':    'minor',
  'GREEN':    'minor',
  'CAT1':     'critical',  // Category 1 — life-threatening (NHSE 2017 framework)
  'CAT2':     'serious',   // Category 2 — emergency
  'CAT3':     'moderate',  // Category 3 — urgent
  'CAT4':     'minor',     // Category 4 — less urgent
  'C1':       'critical',
  'C2':       'serious',
  'C3':       'moderate',
  'C4':       'minor',
};

// ─── AMPDS code parser ────────────────────────────────────────────────────────

function parseAmpdsCode(code: string): {
  type: EmergencyType;
  severity: EmergencySeverity;
} | null {
  if (!code || typeof code !== 'string') return null;
  // Format: "09E01" or "09-E-01" or "09E1"
  const clean = code.replace(/[-\s]/g, '').toUpperCase();
  const match = clean.match(/^(\d{2})([EDCBAO])(\d+)$/);
  if (!match) return null;

  const [, cc, det] = match;
  const type = AMPDS_CC_MAP[cc] ?? 'other_medical';
  const severity = AMPDS_DETERMINANT_MAP[det] ?? 'serious';
  return { type, severity };
}

// ─── Location helpers ─────────────────────────────────────────────────────────

function parseLocation(raw: unknown): {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  what3words: string | null;
  description: string | null;
} {
  const loc = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {};

  const latitude = typeof loc.latitude === 'number' ? loc.latitude
    : typeof loc.lat === 'number' ? loc.lat
    : typeof loc.latitude === 'string' ? parseFloat(loc.latitude as string)
    : null;

  const longitude = typeof loc.longitude === 'number' ? loc.longitude
    : typeof loc.lng === 'number' ? loc.lng
    : typeof loc.long === 'number' ? loc.long
    : typeof loc.longitude === 'string' ? parseFloat(loc.longitude as string)
    : null;

  const address = (loc.address as string | null) ?? null;
  const description = (loc.description as string | null) ?? null;

  // What3Words: accept "///word.word.word" or "word.word.word"
  let what3words = (loc.what3words as string | null) ?? null;
  if (what3words) {
    what3words = what3words.replace(/^\/\/\//, '');
    if (!/^\w+\.\w+\.\w+$/.test(what3words)) what3words = null;
  }

  return {
    latitude: isFinite(latitude as number) ? latitude : null,
    longitude: isFinite(longitude as number) ? longitude : null,
    address,
    what3words,
    description,
  };
}

// ─── Main normaliser ──────────────────────────────────────────────────────────

export interface RawCadPayload {
  // Identification
  incident_ref?: string;
  incident_number?: string;
  cad_ref?: string;

  // Call classification — accepts AMPDS code OR direct enum name
  ampds_code?: string;
  call_type?: string;        // AMPDS code OR EmergencyType enum value
  emergency_type?: string;   // Direct enum value

  // Priority / severity
  priority?: string;         // 'RED', 'CAT1', 'CHARLIE', etc.
  severity?: string;         // Direct: 'critical', 'serious', etc.
  category?: string;         // Alternative priority field name
  determinant?: string;      // AMPDS determinant letter only

  // Location
  location?: unknown;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  address?: string;
  what3words?: string;

  // Caller
  caller_phone?: string;
  caller_name?: string;
  reporter_phone?: string;
  reporter_name?: string;

  // Clinical details
  notes?: string;
  description?: string;
  casualty_count?: number;
  casualties?: number;
  conscious?: boolean;
  breathing?: boolean;
  casualties_conscious?: boolean;
  casualties_breathing?: boolean;

  // EMS status
  ambulance_dispatched?: boolean;
  ambulance_notified?: boolean;
  ambulance_eta_minutes?: number;
  ems_eta?: number;
}

export function normaliseCadPayload(raw: RawCadPayload): NormalisedEmergency {
  // ── Incident reference ───────────────────────────────────────────────────
  const cadIncidentRef =
    raw.incident_ref ?? raw.incident_number ?? raw.cad_ref ??
    `CAD-${Date.now()}`;

  // ── Emergency type + severity ────────────────────────────────────────────
  let emergencyType: EmergencyType = 'other_medical';
  let severity: EmergencySeverity = 'serious';

  // Try AMPDS code first (most precise)
  const ampdsCode = raw.ampds_code ?? raw.call_type;
  const ampds = parseAmpdsCode(ampdsCode ?? '');
  if (ampds) {
    emergencyType = ampds.type;
    severity = ampds.severity;
  } else {
    // Fall back to direct enum value
    const directType = (raw.emergency_type ?? raw.call_type ?? '').toLowerCase();
    if (directType && directType in ({} as Record<EmergencyType, true>)) {
      emergencyType = directType as EmergencyType;
    } else if (directType) {
      // Fuzzy match common aliases
      const typeAliases: Record<string, EmergencyType> = {
        'cardiac': 'cardiac_arrest', 'cardiac arrest': 'cardiac_arrest',
        'ohca': 'cardiac_arrest', 'heart attack': 'heart_attack',
        'mi': 'heart_attack', 'acs': 'heart_attack',
        'stroke': 'stroke', 'cva': 'stroke', 'tia': 'stroke',
        'rta': 'road_accident', 'rta/rtc': 'road_accident', 'rtc': 'road_accident',
        'fit': 'seizure', 'seizure': 'seizure', 'convulsion': 'seizure',
        'anaphylaxis': 'anaphylaxis', 'allergic': 'anaphylaxis',
        'diabetic': 'diabetic_emergency', 'hypo': 'diabetic_emergency',
        'choke': 'choking', 'choking': 'choking',
        'fall': 'serious_fall', 'fallen': 'serious_fall',
        'stab': 'stabbing', 'stabbing': 'stabbing',
        'assault': 'assault', 'violence': 'assault',
        'drowning': 'drowning', 'drown': 'drowning',
        'burn': 'burn', 'burns': 'burn', 'fire': 'burn',
        'overdose': 'overdose', 'ods': 'overdose',
        'breathing': 'breathing_difficulty', 'dyspnoea': 'breathing_difficulty',
      };
      emergencyType = typeAliases[directType] ?? 'other_medical';
    }
  }

  // Override severity if explicitly provided
  const rawSeverity = (raw.severity ?? raw.priority ?? raw.category ?? '').toUpperCase();
  const mappedSeverity = PRIORITY_LABEL_MAP[rawSeverity];
  if (mappedSeverity) severity = mappedSeverity;

  // ── Location ─────────────────────────────────────────────────────────────
  const locSource = raw.location ?? raw;
  const loc = parseLocation(locSource);

  // Top-level lat/lng override
  const latitude = loc.latitude ??
    (typeof raw.latitude === 'number' ? raw.latitude : null) ??
    (typeof raw.lat === 'number' ? raw.lat : null);
  const longitude = loc.longitude ??
    (typeof raw.longitude === 'number' ? raw.longitude : null) ??
    (typeof raw.lng === 'number' ? raw.lng : null);

  if (latitude === null || longitude === null) {
    throw new Error('CAD payload missing valid coordinates');
  }

  const what3words = loc.what3words ?? (raw.what3words?.replace(/^\/\/\//, '') ?? null);
  const locationAddress = loc.address ?? (raw.address as string | null) ?? null;
  const locationDescription = loc.description ?? null;

  // ── Caller ───────────────────────────────────────────────────────────────
  const reporterPhone = raw.caller_phone ?? raw.reporter_phone ?? null;
  const reporterName = raw.caller_name ?? raw.reporter_name ?? null;

  // ── Clinical ─────────────────────────────────────────────────────────────
  const description = raw.notes ?? raw.description ?? null;
  const casualtyCount = Math.max(1, Number(raw.casualty_count ?? raw.casualties ?? 1));
  const casualtiesConscious = raw.conscious ?? raw.casualties_conscious ?? null;
  const casualtiesBreathing = raw.breathing ?? raw.casualties_breathing ?? null;

  // ── EMS status ────────────────────────────────────────────────────────────
  const ambulanceNotified =
    raw.ambulance_notified ?? raw.ambulance_dispatched ?? true;  // CAD → ambulance knows
  const ambulanceEtaMinutes = raw.ambulance_eta_minutes ?? raw.ems_eta ?? null;

  return {
    cadIncidentRef,
    emergencyType,
    severity,
    latitude,
    longitude,
    locationAddress,
    locationDescription,
    what3words: what3words ?? null,
    reporterPhone,
    reporterName,
    description,
    casualtyCount,
    casualtiesConscious: casualtiesConscious === null ? null : Boolean(casualtiesConscious),
    casualtiesBreathing: casualtiesBreathing === null ? null : Boolean(casualtiesBreathing),
    ambulanceNotified: Boolean(ambulanceNotified),
    ambulanceEtaMinutes: ambulanceEtaMinutes ? Number(ambulanceEtaMinutes) : null,
  };
}
