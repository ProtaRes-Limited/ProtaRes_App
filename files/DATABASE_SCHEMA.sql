-- ============================================
-- PROTARES DATABASE SCHEMA
-- Supabase PostgreSQL Database
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- For geospatial queries
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption

-- ============================================
-- ENUMS
-- ============================================

-- Responder credential tiers
CREATE TYPE responder_tier AS ENUM (
  'tier1_active_healthcare',
  'tier2_retired_healthcare',
  'tier3_first_aid',
  'tier4_witness'
);

-- Responder availability status
CREATE TYPE availability_status AS ENUM (
  'available',      -- On duty, accepting alerts
  'busy',           -- Responding to emergency
  'unavailable',    -- Off duty
  'do_not_disturb'  -- Temporarily unavailable
);

-- Emergency types
CREATE TYPE emergency_type AS ENUM (
  'cardiac_arrest',
  'heart_attack',
  'road_accident',
  'pedestrian_incident',
  'cyclist_incident',
  'stroke',
  'diabetic_emergency',
  'anaphylaxis',
  'seizure',
  'breathing_difficulty',
  'stabbing',
  'assault',
  'serious_fall',
  'choking',
  'drowning',
  'burn',
  'electrocution',
  'overdose',
  'other_medical',
  'other_trauma'
);

-- Emergency severity
CREATE TYPE emergency_severity AS ENUM (
  'critical',    -- Immediate life threat
  'serious',     -- Significant injury/illness
  'moderate',    -- Needs attention but stable
  'minor'        -- Low priority
);

-- Emergency status
CREATE TYPE emergency_status AS ENUM (
  'reported',           -- Initial report received
  'dispatched',         -- Responders alerted
  'responder_en_route', -- Responder accepted, travelling
  'responder_on_scene', -- Responder arrived
  'ems_en_route',       -- Ambulance dispatched
  'ems_on_scene',       -- Ambulance arrived
  'handover_complete',  -- Transferred to EMS
  'resolved',           -- Emergency resolved
  'cancelled',          -- False alarm or cancelled
  'no_response'         -- No responders available
);

-- Response status for individual responders
CREATE TYPE response_status AS ENUM (
  'alerted',     -- Alert sent
  'accepted',    -- Responder accepted
  'declined',    -- Responder declined
  'en_route',    -- Travelling to scene
  'on_scene',    -- Arrived at scene
  'intervening', -- Providing care
  'completing',  -- Finishing up
  'completed',   -- Response complete
  'withdrawn'    -- Withdrew from response
);

-- Transport modes
CREATE TYPE transport_mode AS ENUM (
  'stationary',
  'walking',
  'cycling',
  'bus',
  'train',
  'driving',
  'unknown'
);

-- Credential verification status
CREATE TYPE verification_status AS ENUM (
  'pending',
  'verified',
  'rejected',
  'expired',
  'revoked'
);

-- Equipment types
CREATE TYPE equipment_type AS ENUM (
  'aed',
  'trauma_kit',
  'burn_kit',
  'naloxone_kit',
  'obstetric_kit',
  'basic_medical_kit',
  'oxygen',
  'cutting_gear'
);

-- ============================================
-- TABLES
-- ============================================

-- --------------------------------------------
-- USERS & PROFILES
-- --------------------------------------------

-- Responder profiles (extends Supabase auth.users)
CREATE TABLE responders (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  email TEXT NOT NULL,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  profile_photo_url TEXT,
  
  -- Responder classification
  tier responder_tier NOT NULL DEFAULT 'tier4_witness',
  availability availability_status NOT NULL DEFAULT 'unavailable',
  
  -- Location (updated frequently when on duty)
  current_location GEOGRAPHY(POINT, 4326),
  current_transport_mode transport_mode DEFAULT 'unknown',
  location_updated_at TIMESTAMPTZ,
  
  -- Settings
  alert_radius_km DECIMAL(4,1) DEFAULT 5.0,
  sms_fallback_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  
  -- Statistics
  total_responses INTEGER DEFAULT 0,
  total_accepted INTEGER DEFAULT 0,
  total_declined INTEGER DEFAULT 0,
  average_response_time_seconds INTEGER,
  
  -- Privacy & consent
  location_consent BOOLEAN DEFAULT false,
  location_consent_at TIMESTAMPTZ,
  data_processing_consent BOOLEAN DEFAULT false,
  data_processing_consent_at TIMESTAMPTZ,
  marketing_consent BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ  -- Soft delete for GDPR
);

-- Index for geospatial queries
CREATE INDEX idx_responders_location ON responders USING GIST (current_location);
CREATE INDEX idx_responders_availability ON responders (availability) WHERE deleted_at IS NULL;
CREATE INDEX idx_responders_tier ON responders (tier);

-- --------------------------------------------
-- CREDENTIALS
-- --------------------------------------------

-- Responder credentials (GMC, NMC, First Aid certs)
CREATE TABLE credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  responder_id UUID NOT NULL REFERENCES responders(id) ON DELETE CASCADE,
  
  -- Credential details
  credential_type TEXT NOT NULL, -- 'gmc', 'nmc', 'hcpc', 'first_aid_sja', 'first_aid_redcross'
  credential_number TEXT,        -- Encrypted
  credential_number_hash TEXT,   -- For lookup without decryption
  
  -- Verification
  verification_status verification_status DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  verified_by TEXT,              -- 'api_gmc', 'api_nmc', 'manual_review'
  verification_response JSONB,   -- API response (sanitized)
  
  -- Expiry
  issued_at DATE,
  expires_at DATE,
  
  -- Supporting documents (for first aid certs)
  document_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credentials_responder ON credentials (responder_id);
CREATE INDEX idx_credentials_type_status ON credentials (credential_type, verification_status);

-- --------------------------------------------
-- EMERGENCIES
-- --------------------------------------------

-- Emergency incidents
CREATE TABLE emergencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info
  emergency_type emergency_type NOT NULL,
  severity emergency_severity DEFAULT 'serious',
  status emergency_status DEFAULT 'reported',
  
  -- Location
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  location_address TEXT,
  location_description TEXT,      -- "Outside Tesco, High Street"
  what3words TEXT,               -- What3Words address if available
  
  -- Reporter
  reported_by UUID REFERENCES responders(id),
  reporter_phone TEXT,            -- For non-app reports
  reporter_name TEXT,
  
  -- Details
  description TEXT,
  casualty_count INTEGER DEFAULT 1,
  casualties_conscious BOOLEAN,
  casualties_breathing BOOLEAN,
  
  -- Witness Mode
  witness_stream_active BOOLEAN DEFAULT false,
  witness_stream_url TEXT,
  
  -- Equipment
  equipment_requested equipment_type[],
  equipment_delivered equipment_type[],
  
  -- Multi-agency
  ambulance_notified BOOLEAN DEFAULT false,
  ambulance_notified_at TIMESTAMPTZ,
  ambulance_eta_minutes INTEGER,
  police_notified BOOLEAN DEFAULT false,
  fire_notified BOOLEAN DEFAULT false,
  
  -- Outcome
  outcome_notes TEXT,
  patient_outcome TEXT,           -- 'survived', 'deceased', 'unknown'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_emergencies_location ON emergencies USING GIST (location);
CREATE INDEX idx_emergencies_status ON emergencies (status) WHERE status NOT IN ('resolved', 'cancelled');
CREATE INDEX idx_emergencies_type ON emergencies (emergency_type);
CREATE INDEX idx_emergencies_created ON emergencies (created_at DESC);

-- --------------------------------------------
-- RESPONSES
-- --------------------------------------------

-- Individual responder responses to emergencies
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emergency_id UUID NOT NULL REFERENCES emergencies(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES responders(id) ON DELETE CASCADE,
  
  -- Alert details
  alerted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  alert_method TEXT DEFAULT 'push', -- 'push', 'sms', 'both'
  estimated_eta_seconds INTEGER,
  
  -- Response
  status response_status DEFAULT 'alerted',
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  
  -- Journey
  departed_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  transport_mode transport_mode,
  
  -- On-scene
  interventions_performed TEXT[],  -- ['cpr', 'aed_used', 'bleeding_control']
  equipment_used equipment_type[],
  notes TEXT,
  
  -- Handover
  handover_at TIMESTAMPTZ,
  handover_to TEXT,               -- 'ambulance', 'police', 'family'
  handover_notes TEXT,
  
  -- Completion
  completed_at TIMESTAMPTZ,
  feedback_rating INTEGER,        -- 1-5
  feedback_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(emergency_id, responder_id)
);

CREATE INDEX idx_responses_emergency ON responses (emergency_id);
CREATE INDEX idx_responses_responder ON responses (responder_id);
CREATE INDEX idx_responses_status ON responses (status);

-- --------------------------------------------
-- LOCATION HISTORY
-- --------------------------------------------

-- Location tracking (rolling 24-hour retention)
CREATE TABLE location_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  responder_id UUID NOT NULL REFERENCES responders(id) ON DELETE CASCADE,
  
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  accuracy_meters DECIMAL(6,2),
  altitude_meters DECIMAL(7,2),
  heading DECIMAL(5,2),           -- 0-360 degrees
  speed_mps DECIMAL(6,2),         -- meters per second
  transport_mode transport_mode,
  
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Auto-delete after 24 hours (via cron job)
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX idx_location_history_responder ON location_history (responder_id, recorded_at DESC);
CREATE INDEX idx_location_history_expires ON location_history (expires_at);

-- --------------------------------------------
-- EQUIPMENT
-- --------------------------------------------

-- Equipment locations (AEDs, trauma kits, etc.)
CREATE TABLE equipment_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  equipment_type equipment_type NOT NULL,
  name TEXT,                      -- "Tesco High Street AED"
  description TEXT,
  
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  location_address TEXT,
  location_details TEXT,          -- "Inside main entrance, on wall"
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  available_hours TEXT,           -- "24/7" or "Mon-Fri 9-5"
  access_instructions TEXT,
  
  -- Status
  last_checked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  needs_maintenance BOOLEAN DEFAULT false,
  
  -- Owner
  owner_organisation TEXT,
  owner_contact TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_location ON equipment_locations USING GIST (location);
CREATE INDEX idx_equipment_type ON equipment_locations (equipment_type) WHERE is_available = true;

-- --------------------------------------------
-- NOTIFICATIONS
-- --------------------------------------------

-- Push notification tokens
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  responder_id UUID NOT NULL REFERENCES responders(id) ON DELETE CASCADE,
  
  token TEXT NOT NULL,
  platform TEXT NOT NULL,         -- 'ios', 'android'
  device_id TEXT,
  
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(responder_id, token)
);

CREATE INDEX idx_push_tokens_responder ON push_tokens (responder_id) WHERE is_active = true;

-- Notification log
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  responder_id UUID NOT NULL REFERENCES responders(id) ON DELETE CASCADE,
  emergency_id UUID REFERENCES emergencies(id) ON DELETE SET NULL,
  
  notification_type TEXT NOT NULL, -- 'emergency_alert', 'status_update', 'reminder'
  channel TEXT NOT NULL,           -- 'push', 'sms', 'email'
  
  title TEXT,
  body TEXT,
  data JSONB,
  
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT
);

CREATE INDEX idx_notification_log_responder ON notification_log (responder_id, sent_at DESC);

-- --------------------------------------------
-- GDPR & AUDIT
-- --------------------------------------------

-- Data subject requests
CREATE TABLE data_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  responder_id UUID NOT NULL REFERENCES responders(id) ON DELETE CASCADE,
  
  request_type TEXT NOT NULL,     -- 'export', 'delete', 'rectify'
  status TEXT DEFAULT 'pending',  -- 'pending', 'processing', 'completed', 'rejected'
  
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by TEXT,
  
  notes TEXT,
  export_file_url TEXT           -- For export requests
);

CREATE INDEX idx_data_requests_responder ON data_requests (responder_id);
CREATE INDEX idx_data_requests_status ON data_requests (status) WHERE status = 'pending';

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  user_id UUID,                   -- Who performed action
  user_role TEXT,                 -- 'responder', 'admin', 'system'
  
  action TEXT NOT NULL,           -- 'login', 'view_emergency', 'update_location'
  resource_type TEXT,             -- 'responder', 'emergency', 'credential'
  resource_id UUID,
  
  details JSONB,                  -- Action-specific details (no PII)
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log (user_id, created_at DESC);
CREATE INDEX idx_audit_log_resource ON audit_log (resource_type, resource_id);
CREATE INDEX idx_audit_log_created ON audit_log (created_at DESC);

-- --------------------------------------------
-- CONSENT MANAGEMENT
-- --------------------------------------------

CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  responder_id UUID NOT NULL REFERENCES responders(id) ON DELETE CASCADE,
  
  consent_type TEXT NOT NULL,     -- 'location_tracking', 'data_processing', 'marketing'
  granted BOOLEAN NOT NULL,
  
  consent_version TEXT,           -- Version of privacy policy
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consent_records_responder ON consent_records (responder_id, consent_type);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE responders ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------
-- RLS Policies: Responders
-- --------------------------------------------

-- Users can read their own profile
CREATE POLICY "responders_select_own" ON responders
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "responders_update_own" ON responders
  FOR UPDATE USING (auth.uid() = id);

-- Service role can do anything (for Edge Functions)
CREATE POLICY "responders_service_role" ON responders
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- --------------------------------------------
-- RLS Policies: Credentials
-- --------------------------------------------

CREATE POLICY "credentials_select_own" ON credentials
  FOR SELECT USING (responder_id = auth.uid());

CREATE POLICY "credentials_insert_own" ON credentials
  FOR INSERT WITH CHECK (responder_id = auth.uid());

CREATE POLICY "credentials_update_own" ON credentials
  FOR UPDATE USING (responder_id = auth.uid());

CREATE POLICY "credentials_service_role" ON credentials
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- --------------------------------------------
-- RLS Policies: Emergencies
-- --------------------------------------------

-- All authenticated users can see active emergencies in their area
CREATE POLICY "emergencies_select_active" ON emergencies
  FOR SELECT USING (
    auth.role() = 'authenticated' 
    AND status NOT IN ('resolved', 'cancelled')
  );

-- Users can see emergencies they reported
CREATE POLICY "emergencies_select_reported" ON emergencies
  FOR SELECT USING (reported_by = auth.uid());

-- Users can report emergencies
CREATE POLICY "emergencies_insert" ON emergencies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "emergencies_service_role" ON emergencies
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- --------------------------------------------
-- RLS Policies: Responses
-- --------------------------------------------

CREATE POLICY "responses_select_own" ON responses
  FOR SELECT USING (responder_id = auth.uid());

CREATE POLICY "responses_insert_own" ON responses
  FOR INSERT WITH CHECK (responder_id = auth.uid());

CREATE POLICY "responses_update_own" ON responses
  FOR UPDATE USING (responder_id = auth.uid());

CREATE POLICY "responses_service_role" ON responses
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- --------------------------------------------
-- RLS Policies: Location History
-- --------------------------------------------

-- Users can only see their own location history
CREATE POLICY "location_history_select_own" ON location_history
  FOR SELECT USING (responder_id = auth.uid());

CREATE POLICY "location_history_insert_own" ON location_history
  FOR INSERT WITH CHECK (responder_id = auth.uid());

CREATE POLICY "location_history_service_role" ON location_history
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- --------------------------------------------
-- RLS Policies: Equipment
-- --------------------------------------------

-- All authenticated users can see equipment
CREATE POLICY "equipment_select_all" ON equipment_locations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "equipment_service_role" ON equipment_locations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER responders_updated_at
  BEFORE UPDATE ON responders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER credentials_updated_at
  BEFORE UPDATE ON credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER emergencies_updated_at
  BEFORE UPDATE ON emergencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER responses_updated_at
  BEFORE UPDATE ON responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER equipment_updated_at
  BEFORE UPDATE ON equipment_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to find nearby responders using Corridor Algorithm
-- (Simplified version - full implementation in Edge Function)
CREATE OR REPLACE FUNCTION find_nearby_responders(
  emergency_location GEOGRAPHY,
  radius_meters INTEGER DEFAULT 5000,
  min_tier responder_tier DEFAULT 'tier4_witness'
)
RETURNS TABLE (
  responder_id UUID,
  distance_meters DOUBLE PRECISION,
  tier responder_tier,
  transport_mode transport_mode
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    ST_Distance(r.current_location, emergency_location) as distance_meters,
    r.tier,
    r.current_transport_mode
  FROM responders r
  WHERE r.availability = 'available'
    AND r.current_location IS NOT NULL
    AND r.deleted_at IS NULL
    AND r.location_consent = true
    AND ST_DWithin(r.current_location, emergency_location, radius_meters)
    AND r.tier <= min_tier  -- Lower tier number = higher qualification
  ORDER BY 
    r.tier ASC,  -- Prioritize higher-qualified responders
    ST_Distance(r.current_location, emergency_location) ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired location history
CREATE OR REPLACE FUNCTION cleanup_expired_location_history()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM location_history
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to generate Green Badge data
CREATE OR REPLACE FUNCTION generate_green_badge(responder_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  responder_data RECORD;
  credential_data RECORD;
  badge_data JSONB;
BEGIN
  -- Get responder info
  SELECT * INTO responder_data FROM responders WHERE id = responder_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Responder not found';
  END IF;
  
  -- Get verified credential
  SELECT * INTO credential_data 
  FROM credentials 
  WHERE responder_id = responder_uuid 
    AND verification_status = 'verified'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Build badge data
  badge_data = jsonb_build_object(
    'responder_id', responder_uuid,
    'name', responder_data.first_name || ' ' || responder_data.last_name,
    'tier', responder_data.tier,
    'credential_type', credential_data.credential_type,
    'verified', credential_data.verified_at IS NOT NULL,
    'issued_at', NOW(),
    'expires_at', NOW() + INTERVAL '60 seconds',
    'nonce', encode(gen_random_bytes(16), 'hex')
  );
  
  RETURN badge_data;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CRON JOBS (via pg_cron extension)
-- ============================================

-- Run location cleanup every hour
-- SELECT cron.schedule('cleanup-location-history', '0 * * * *', 'SELECT cleanup_expired_location_history()');

-- ============================================
-- SEED DATA (Optional - for development)
-- ============================================

-- Sample equipment locations (London)
INSERT INTO equipment_locations (equipment_type, name, location, location_address, is_available, available_hours) VALUES
  ('aed', 'Victoria Station AED', ST_SetSRID(ST_MakePoint(-0.1426, 51.4952), 4326), 'Victoria Station, London SW1V 1JU', true, '24/7'),
  ('aed', 'Kings Cross AED', ST_SetSRID(ST_MakePoint(-0.1246, 51.5320), 4326), 'Kings Cross Station, London N1C 4AP', true, '24/7'),
  ('aed', 'Tesco Metro Oxford St', ST_SetSRID(ST_MakePoint(-0.1419, 51.5148), 4326), '311 Oxford Street, London W1C 2HP', true, '06:00-00:00'),
  ('trauma_kit', 'LAS Station Waterloo', ST_SetSRID(ST_MakePoint(-0.1132, 51.5033), 4326), 'Waterloo Ambulance Station', true, '24/7');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE responders IS 'Registered emergency responders across all tiers';
COMMENT ON TABLE credentials IS 'Professional credentials (GMC, NMC, First Aid certs)';
COMMENT ON TABLE emergencies IS 'Reported emergency incidents';
COMMENT ON TABLE responses IS 'Individual responder responses to emergencies';
COMMENT ON TABLE location_history IS 'Rolling 24-hour location tracking (auto-deleted)';
COMMENT ON TABLE equipment_locations IS 'Registered medical equipment locations (AEDs, etc.)';
COMMENT ON TABLE push_tokens IS 'Push notification device tokens';
COMMENT ON TABLE data_requests IS 'GDPR data subject requests';
COMMENT ON TABLE audit_log IS 'System audit trail';
COMMENT ON TABLE consent_records IS 'User consent records for GDPR';

COMMENT ON COLUMN responders.current_location IS 'Last known location (only when on duty and consented)';
COMMENT ON COLUMN responders.tier IS 'Responder qualification tier: 1=Active HC, 2=Retired HC, 3=First Aid, 4=Witness';
COMMENT ON COLUMN credentials.credential_number IS 'Encrypted credential number (GMC/NMC)';
COMMENT ON COLUMN location_history.expires_at IS 'Auto-delete after 24 hours for privacy';
