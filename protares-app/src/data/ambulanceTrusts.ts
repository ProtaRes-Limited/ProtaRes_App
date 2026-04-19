/**
 * UK NHS Ambulance Trust mapping — postcode area → Trust.
 *
 * The UK has ~14 regional ambulance services. Trust boundaries do not always
 * match postcode areas perfectly (a handful of postcodes straddle two trusts),
 * but at the area level (first 1-2 letters) this mapping is correct for the
 * dominant trust, which is what we display to users.
 *
 * No public NHS API returns Trust-by-postcode in a queryable form, so this
 * table is static. Revisit roughly annually; merges and boundary changes are
 * rare but do happen (e.g. Isle of Wight Ambulance merged into SCAS in 2012).
 */

export interface AmbulanceTrust {
  id: string;
  name: string;
  shortName: string;
  website: string;
  // 999 is universal in the UK; 111 is the non-emergency NHS line.
  // Trusts don't have their own 999 numbers. Included for completeness.
  emergencyNumber: string;
  nonEmergencyNumber: string;
}

export const AMBULANCE_TRUSTS = {
  yas: {
    id: 'yas',
    name: 'Yorkshire Ambulance Service NHS Trust',
    shortName: 'Yorkshire Ambulance',
    website: 'https://www.yas.nhs.uk',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
  nwas: {
    id: 'nwas',
    name: 'North West Ambulance Service NHS Trust',
    shortName: 'North West Ambulance',
    website: 'https://www.nwas.nhs.uk',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
  neas: {
    id: 'neas',
    name: 'North East Ambulance Service NHS Foundation Trust',
    shortName: 'North East Ambulance',
    website: 'https://www.neas.nhs.uk',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
  emas: {
    id: 'emas',
    name: 'East Midlands Ambulance Service NHS Trust',
    shortName: 'East Midlands Ambulance',
    website: 'https://www.emas.nhs.uk',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
  wmas: {
    id: 'wmas',
    name: 'West Midlands Ambulance Service University NHS Foundation Trust',
    shortName: 'West Midlands Ambulance',
    website: 'https://wmas.nhs.uk',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
  eeast: {
    id: 'eeast',
    name: 'East of England Ambulance Service NHS Trust',
    shortName: 'East of England Ambulance',
    website: 'https://www.eastamb.nhs.uk',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
  las: {
    id: 'las',
    name: 'London Ambulance Service NHS Trust',
    shortName: 'London Ambulance',
    website: 'https://www.londonambulance.nhs.uk',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
  secamb: {
    id: 'secamb',
    name: 'South East Coast Ambulance Service NHS Foundation Trust',
    shortName: 'South East Coast Ambulance',
    website: 'https://www.secamb.nhs.uk',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
  scas: {
    id: 'scas',
    name: 'South Central Ambulance Service NHS Foundation Trust',
    shortName: 'South Central Ambulance',
    website: 'https://www.scas.nhs.uk',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
  swast: {
    id: 'swast',
    name: 'South Western Ambulance Service NHS Foundation Trust',
    shortName: 'South Western Ambulance',
    website: 'https://www.swast.nhs.uk',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
  iow: {
    id: 'iow',
    name: 'Isle of Wight Ambulance Service',
    shortName: 'Isle of Wight Ambulance',
    website: 'https://www.iow.nhs.uk',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
  was: {
    id: 'was',
    name: 'Welsh Ambulance Services NHS Trust',
    shortName: 'Welsh Ambulance',
    website: 'https://www.wales.nhs.uk/ambulance',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
  sas: {
    id: 'sas',
    name: 'Scottish Ambulance Service',
    shortName: 'Scottish Ambulance',
    website: 'https://www.scottishambulance.com',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
  nias: {
    id: 'nias',
    name: 'Northern Ireland Ambulance Service HSC Trust',
    shortName: 'NI Ambulance',
    website: 'https://nias.hscni.net',
    emergencyNumber: '999',
    nonEmergencyNumber: '111',
  },
} as const satisfies Record<string, AmbulanceTrust>;

type TrustId = keyof typeof AMBULANCE_TRUSTS;

/**
 * Postcode area → trust ID. Only the first 1-2 letters of the postcode are
 * needed. Coverage below is for the dominant trust of each area; a small
 * minority of postcodes at trust boundaries may cross over but emergency
 * dispatch (999) routes based on location automatically, so this is only
 * used for display purposes ("Your local trust is…").
 */
const POSTCODE_AREA_TO_TRUST: Record<string, TrustId> = {
  // Yorkshire & Humber
  BD: 'yas', DN: 'yas', HD: 'yas', HG: 'yas', HU: 'yas', HX: 'yas',
  LS: 'yas', S: 'yas', WF: 'yas', YO: 'yas',
  // North East
  DH: 'neas', DL: 'neas', NE: 'neas', SR: 'neas', TS: 'neas',
  // North West
  BB: 'nwas', BL: 'nwas', CA: 'nwas', CH: 'nwas', CW: 'nwas',
  FY: 'nwas', L: 'nwas', LA: 'nwas', M: 'nwas', OL: 'nwas',
  PR: 'nwas', SK: 'nwas', WA: 'nwas', WN: 'nwas',
  // East Midlands
  DE: 'emas', LE: 'emas', LN: 'emas', NG: 'emas', NN: 'emas',
  // West Midlands
  B: 'wmas', CV: 'wmas', DY: 'wmas', HR: 'wmas', ST: 'wmas',
  SY: 'wmas', TF: 'wmas', WR: 'wmas', WS: 'wmas', WV: 'wmas',
  // East of England
  AL: 'eeast', CB: 'eeast', CM: 'eeast', CO: 'eeast', IP: 'eeast',
  LU: 'eeast', MK: 'eeast', NR: 'eeast', PE: 'eeast', SG: 'eeast',
  SS: 'eeast',
  // London
  BR: 'las', CR: 'las', DA: 'las', E: 'las', EC: 'las', EN: 'las',
  HA: 'las', IG: 'las', KT: 'las', N: 'las', NW: 'las', RM: 'las',
  SE: 'las', SM: 'las', SW: 'las', TW: 'las', UB: 'las', W: 'las',
  WC: 'las', WD: 'las',
  // South East Coast
  BN: 'secamb', CT: 'secamb', ME: 'secamb', RH: 'secamb', TN: 'secamb',
  // South Central
  GU: 'scas', OX: 'scas', RG: 'scas', SL: 'scas', SP: 'scas',
  // South West
  BA: 'swast', BH: 'swast', BS: 'swast', DT: 'swast', EX: 'swast',
  GL: 'swast', PL: 'swast', SN: 'swast', SO: 'swast', TA: 'swast',
  TQ: 'swast', TR: 'swast',
  // Isle of Wight
  PO: 'iow',
  // Wales
  CF: 'was', LD: 'was', LL: 'was', NP: 'was', SA: 'was',
  // Scotland
  AB: 'sas', DD: 'sas', DG: 'sas', EH: 'sas', FK: 'sas', G: 'sas',
  HS: 'sas', IV: 'sas', KA: 'sas', KW: 'sas', KY: 'sas', ML: 'sas',
  PA: 'sas', PH: 'sas', TD: 'sas', ZE: 'sas',
  // Northern Ireland
  BT: 'nias',
};

/**
 * Extract the postcode area (leading letters) from a full postcode.
 * "HU5 2JZ" → "HU", "B1 1AA" → "B", "DN14" → "DN".
 */
function postcodeArea(postcode: string): string {
  const cleaned = postcode.trim().toUpperCase();
  const match = cleaned.match(/^([A-Z]+)/);
  return match?.[1] ?? '';
}

export function trustForPostcode(postcode: string): AmbulanceTrust | null {
  const area = postcodeArea(postcode);
  if (!area) return null;
  // Try exact area first (e.g. "HU"), then fall back to single letter ("B").
  const trustId = POSTCODE_AREA_TO_TRUST[area] ?? POSTCODE_AREA_TO_TRUST[area[0] ?? ''];
  return trustId ? AMBULANCE_TRUSTS[trustId] : null;
}
