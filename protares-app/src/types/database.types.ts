export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          consent_type: string
          consent_version: string | null
          created_at: string | null
          granted: boolean
          id: string
          ip_address: unknown
          responder_id: string
          user_agent: string | null
        }
        Insert: {
          consent_type: string
          consent_version?: string | null
          created_at?: string | null
          granted: boolean
          id?: string
          ip_address?: unknown
          responder_id: string
          user_agent?: string | null
        }
        Update: {
          consent_type?: string
          consent_version?: string | null
          created_at?: string | null
          granted?: boolean
          id?: string
          ip_address?: unknown
          responder_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      credentials: {
        Row: {
          created_at: string | null
          credential_number: string | null
          credential_number_hash: string | null
          credential_type: string
          document_url: string | null
          expires_at: string | null
          id: string
          issued_at: string | null
          responder_id: string
          updated_at: string | null
          verification_response: Json | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          credential_number?: string | null
          credential_number_hash?: string | null
          credential_type: string
          document_url?: string | null
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          responder_id: string
          updated_at?: string | null
          verification_response?: Json | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          credential_number?: string | null
          credential_number_hash?: string | null
          credential_type?: string
          document_url?: string | null
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          responder_id?: string
          updated_at?: string | null
          verification_response?: Json | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credentials_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      data_requests: {
        Row: {
          export_file_url: string | null
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          request_type: string
          requested_at: string | null
          responder_id: string
          status: string | null
        }
        Insert: {
          export_file_url?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type: string
          requested_at?: string | null
          responder_id: string
          status?: string | null
        }
        Update: {
          export_file_url?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type?: string
          requested_at?: string | null
          responder_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_requests_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      emergencies: {
        Row: {
          ambulance_eta_minutes: number | null
          ambulance_notified: boolean | null
          ambulance_notified_at: string | null
          casualties_breathing: boolean | null
          casualties_conscious: boolean | null
          casualty_count: number | null
          created_at: string | null
          description: string | null
          emergency_type: Database["public"]["Enums"]["emergency_type"]
          equipment_delivered:
            | Database["public"]["Enums"]["equipment_type"][]
            | null
          equipment_requested:
            | Database["public"]["Enums"]["equipment_type"][]
            | null
          fire_notified: boolean | null
          id: string
          location: unknown
          location_address: string | null
          location_description: string | null
          outcome_notes: string | null
          patient_outcome: string | null
          police_notified: boolean | null
          reported_by: string | null
          reporter_name: string | null
          reporter_phone: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["emergency_severity"] | null
          status: Database["public"]["Enums"]["emergency_status"] | null
          updated_at: string | null
          what3words: string | null
          witness_stream_active: boolean | null
          witness_stream_url: string | null
        }
        Insert: {
          ambulance_eta_minutes?: number | null
          ambulance_notified?: boolean | null
          ambulance_notified_at?: string | null
          casualties_breathing?: boolean | null
          casualties_conscious?: boolean | null
          casualty_count?: number | null
          created_at?: string | null
          description?: string | null
          emergency_type: Database["public"]["Enums"]["emergency_type"]
          equipment_delivered?:
            | Database["public"]["Enums"]["equipment_type"][]
            | null
          equipment_requested?:
            | Database["public"]["Enums"]["equipment_type"][]
            | null
          fire_notified?: boolean | null
          id?: string
          location: unknown
          location_address?: string | null
          location_description?: string | null
          outcome_notes?: string | null
          patient_outcome?: string | null
          police_notified?: boolean | null
          reported_by?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["emergency_severity"] | null
          status?: Database["public"]["Enums"]["emergency_status"] | null
          updated_at?: string | null
          what3words?: string | null
          witness_stream_active?: boolean | null
          witness_stream_url?: string | null
        }
        Update: {
          ambulance_eta_minutes?: number | null
          ambulance_notified?: boolean | null
          ambulance_notified_at?: string | null
          casualties_breathing?: boolean | null
          casualties_conscious?: boolean | null
          casualty_count?: number | null
          created_at?: string | null
          description?: string | null
          emergency_type?: Database["public"]["Enums"]["emergency_type"]
          equipment_delivered?:
            | Database["public"]["Enums"]["equipment_type"][]
            | null
          equipment_requested?:
            | Database["public"]["Enums"]["equipment_type"][]
            | null
          fire_notified?: boolean | null
          id?: string
          location?: unknown
          location_address?: string | null
          location_description?: string | null
          outcome_notes?: string | null
          patient_outcome?: string | null
          police_notified?: boolean | null
          reported_by?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["emergency_severity"] | null
          status?: Database["public"]["Enums"]["emergency_status"] | null
          updated_at?: string | null
          what3words?: string | null
          witness_stream_active?: boolean | null
          witness_stream_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergencies_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_locations: {
        Row: {
          access_instructions: string | null
          available_hours: string | null
          created_at: string | null
          description: string | null
          equipment_type: Database["public"]["Enums"]["equipment_type"]
          id: string
          is_available: boolean | null
          last_checked_at: string | null
          last_used_at: string | null
          location: unknown
          location_address: string | null
          location_details: string | null
          name: string | null
          needs_maintenance: boolean | null
          owner_contact: string | null
          owner_organisation: string | null
          updated_at: string | null
        }
        Insert: {
          access_instructions?: string | null
          available_hours?: string | null
          created_at?: string | null
          description?: string | null
          equipment_type: Database["public"]["Enums"]["equipment_type"]
          id?: string
          is_available?: boolean | null
          last_checked_at?: string | null
          last_used_at?: string | null
          location: unknown
          location_address?: string | null
          location_details?: string | null
          name?: string | null
          needs_maintenance?: boolean | null
          owner_contact?: string | null
          owner_organisation?: string | null
          updated_at?: string | null
        }
        Update: {
          access_instructions?: string | null
          available_hours?: string | null
          created_at?: string | null
          description?: string | null
          equipment_type?: Database["public"]["Enums"]["equipment_type"]
          id?: string
          is_available?: boolean | null
          last_checked_at?: string | null
          last_used_at?: string | null
          location?: unknown
          location_address?: string | null
          location_details?: string | null
          name?: string | null
          needs_maintenance?: boolean | null
          owner_contact?: string | null
          owner_organisation?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      location_history: {
        Row: {
          accuracy_meters: number | null
          altitude_meters: number | null
          expires_at: string
          heading: number | null
          id: string
          location: unknown
          recorded_at: string
          responder_id: string
          speed_mps: number | null
          transport_mode: Database["public"]["Enums"]["transport_mode"] | null
        }
        Insert: {
          accuracy_meters?: number | null
          altitude_meters?: number | null
          expires_at?: string
          heading?: number | null
          id?: string
          location: unknown
          recorded_at?: string
          responder_id: string
          speed_mps?: number | null
          transport_mode?: Database["public"]["Enums"]["transport_mode"] | null
        }
        Update: {
          accuracy_meters?: number | null
          altitude_meters?: number | null
          expires_at?: string
          heading?: number | null
          id?: string
          location?: unknown
          recorded_at?: string
          responder_id?: string
          speed_mps?: number | null
          transport_mode?: Database["public"]["Enums"]["transport_mode"] | null
        }
        Relationships: [
          {
            foreignKeyName: "location_history_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          body: string | null
          channel: string
          data: Json | null
          delivered_at: string | null
          emergency_id: string | null
          failed_at: string | null
          failure_reason: string | null
          id: string
          notification_type: string
          read_at: string | null
          responder_id: string
          sent_at: string | null
          title: string | null
        }
        Insert: {
          body?: string | null
          channel: string
          data?: Json | null
          delivered_at?: string | null
          emergency_id?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          notification_type: string
          read_at?: string | null
          responder_id: string
          sent_at?: string | null
          title?: string | null
        }
        Update: {
          body?: string | null
          channel?: string
          data?: Json | null
          delivered_at?: string | null
          emergency_id?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          notification_type?: string
          read_at?: string | null
          responder_id?: string
          sent_at?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          platform: string
          responder_id: string
          token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform: string
          responder_id: string
          token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform?: string
          responder_id?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      responders: {
        Row: {
          alert_radius_km: number | null
          availability: Database["public"]["Enums"]["availability_status"]
          average_response_time_seconds: number | null
          created_at: string | null
          current_location: unknown
          current_transport_mode:
            | Database["public"]["Enums"]["transport_mode"]
            | null
          data_processing_consent: boolean | null
          data_processing_consent_at: string | null
          date_of_birth: string | null
          deleted_at: string | null
          email: string
          first_name: string
          id: string
          last_active_at: string | null
          last_name: string
          location_consent: boolean | null
          location_consent_at: string | null
          location_updated_at: string | null
          marketing_consent: boolean | null
          phone: string | null
          profile_photo_url: string | null
          push_enabled: boolean | null
          sms_fallback_enabled: boolean | null
          tier: Database["public"]["Enums"]["responder_tier"]
          total_accepted: number | null
          total_declined: number | null
          total_responses: number | null
          updated_at: string | null
        }
        Insert: {
          alert_radius_km?: number | null
          availability?: Database["public"]["Enums"]["availability_status"]
          average_response_time_seconds?: number | null
          created_at?: string | null
          current_location?: unknown
          current_transport_mode?:
            | Database["public"]["Enums"]["transport_mode"]
            | null
          data_processing_consent?: boolean | null
          data_processing_consent_at?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email: string
          first_name: string
          id: string
          last_active_at?: string | null
          last_name: string
          location_consent?: boolean | null
          location_consent_at?: string | null
          location_updated_at?: string | null
          marketing_consent?: boolean | null
          phone?: string | null
          profile_photo_url?: string | null
          push_enabled?: boolean | null
          sms_fallback_enabled?: boolean | null
          tier?: Database["public"]["Enums"]["responder_tier"]
          total_accepted?: number | null
          total_declined?: number | null
          total_responses?: number | null
          updated_at?: string | null
        }
        Update: {
          alert_radius_km?: number | null
          availability?: Database["public"]["Enums"]["availability_status"]
          average_response_time_seconds?: number | null
          created_at?: string | null
          current_location?: unknown
          current_transport_mode?:
            | Database["public"]["Enums"]["transport_mode"]
            | null
          data_processing_consent?: boolean | null
          data_processing_consent_at?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_active_at?: string | null
          last_name?: string
          location_consent?: boolean | null
          location_consent_at?: string | null
          location_updated_at?: string | null
          marketing_consent?: boolean | null
          phone?: string | null
          profile_photo_url?: string | null
          push_enabled?: boolean | null
          sms_fallback_enabled?: boolean | null
          tier?: Database["public"]["Enums"]["responder_tier"]
          total_accepted?: number | null
          total_declined?: number | null
          total_responses?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      responses: {
        Row: {
          accepted_at: string | null
          alert_method: string | null
          alerted_at: string
          arrived_at: string | null
          completed_at: string | null
          created_at: string | null
          decline_reason: string | null
          declined_at: string | null
          departed_at: string | null
          emergency_id: string
          equipment_used: Database["public"]["Enums"]["equipment_type"][] | null
          estimated_eta_seconds: number | null
          feedback_notes: string | null
          feedback_rating: number | null
          handover_at: string | null
          handover_notes: string | null
          handover_to: string | null
          id: string
          interventions_performed: string[] | null
          notes: string | null
          responder_id: string
          status: Database["public"]["Enums"]["response_status"] | null
          transport_mode: Database["public"]["Enums"]["transport_mode"] | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          alert_method?: string | null
          alerted_at?: string
          arrived_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          departed_at?: string | null
          emergency_id: string
          equipment_used?:
            | Database["public"]["Enums"]["equipment_type"][]
            | null
          estimated_eta_seconds?: number | null
          feedback_notes?: string | null
          feedback_rating?: number | null
          handover_at?: string | null
          handover_notes?: string | null
          handover_to?: string | null
          id?: string
          interventions_performed?: string[] | null
          notes?: string | null
          responder_id: string
          status?: Database["public"]["Enums"]["response_status"] | null
          transport_mode?: Database["public"]["Enums"]["transport_mode"] | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          alert_method?: string | null
          alerted_at?: string
          arrived_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          departed_at?: string | null
          emergency_id?: string
          equipment_used?:
            | Database["public"]["Enums"]["equipment_type"][]
            | null
          estimated_eta_seconds?: number | null
          feedback_notes?: string | null
          feedback_rating?: number | null
          handover_at?: string | null
          handover_notes?: string | null
          handover_to?: string | null
          id?: string
          interventions_performed?: string[] | null
          notes?: string | null
          responder_id?: string
          status?: Database["public"]["Enums"]["response_status"] | null
          transport_mode?: Database["public"]["Enums"]["transport_mode"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responses_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      cleanup_expired_location_history: { Args: never; Returns: number }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      find_nearby_responders: {
        Args: {
          emergency_location: unknown
          min_tier?: Database["public"]["Enums"]["responder_tier"]
          radius_meters?: number
        }
        Returns: {
          distance_meters: number
          responder_id: string
          tier: Database["public"]["Enums"]["responder_tier"]
          transport_mode: Database["public"]["Enums"]["transport_mode"]
        }[]
      }
      generate_green_badge: { Args: { responder_uuid: string }; Returns: Json }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      gettransactionid: { Args: never; Returns: unknown }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      availability_status:
        | "available"
        | "busy"
        | "unavailable"
        | "do_not_disturb"
      emergency_severity: "critical" | "serious" | "moderate" | "minor"
      emergency_status:
        | "reported"
        | "dispatched"
        | "responder_en_route"
        | "responder_on_scene"
        | "ems_en_route"
        | "ems_on_scene"
        | "handover_complete"
        | "resolved"
        | "cancelled"
        | "no_response"
      emergency_type:
        | "cardiac_arrest"
        | "heart_attack"
        | "road_accident"
        | "pedestrian_incident"
        | "cyclist_incident"
        | "stroke"
        | "diabetic_emergency"
        | "anaphylaxis"
        | "seizure"
        | "breathing_difficulty"
        | "stabbing"
        | "assault"
        | "serious_fall"
        | "choking"
        | "drowning"
        | "burn"
        | "electrocution"
        | "overdose"
        | "other_medical"
        | "other_trauma"
      equipment_type:
        | "aed"
        | "trauma_kit"
        | "burn_kit"
        | "naloxone_kit"
        | "obstetric_kit"
        | "basic_medical_kit"
        | "oxygen"
        | "cutting_gear"
      responder_tier:
        | "tier1_active_healthcare"
        | "tier2_retired_healthcare"
        | "tier3_first_aid"
        | "tier4_witness"
      response_status:
        | "alerted"
        | "accepted"
        | "declined"
        | "en_route"
        | "on_scene"
        | "intervening"
        | "completing"
        | "completed"
        | "withdrawn"
      transport_mode:
        | "stationary"
        | "walking"
        | "cycling"
        | "bus"
        | "train"
        | "driving"
        | "unknown"
      verification_status:
        | "pending"
        | "verified"
        | "rejected"
        | "expired"
        | "revoked"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      availability_status: [
        "available",
        "busy",
        "unavailable",
        "do_not_disturb",
      ],
      emergency_severity: ["critical", "serious", "moderate", "minor"],
      emergency_status: [
        "reported",
        "dispatched",
        "responder_en_route",
        "responder_on_scene",
        "ems_en_route",
        "ems_on_scene",
        "handover_complete",
        "resolved",
        "cancelled",
        "no_response",
      ],
      emergency_type: [
        "cardiac_arrest",
        "heart_attack",
        "road_accident",
        "pedestrian_incident",
        "cyclist_incident",
        "stroke",
        "diabetic_emergency",
        "anaphylaxis",
        "seizure",
        "breathing_difficulty",
        "stabbing",
        "assault",
        "serious_fall",
        "choking",
        "drowning",
        "burn",
        "electrocution",
        "overdose",
        "other_medical",
        "other_trauma",
      ],
      equipment_type: [
        "aed",
        "trauma_kit",
        "burn_kit",
        "naloxone_kit",
        "obstetric_kit",
        "basic_medical_kit",
        "oxygen",
        "cutting_gear",
      ],
      responder_tier: [
        "tier1_active_healthcare",
        "tier2_retired_healthcare",
        "tier3_first_aid",
        "tier4_witness",
      ],
      response_status: [
        "alerted",
        "accepted",
        "declined",
        "en_route",
        "on_scene",
        "intervening",
        "completing",
        "completed",
        "withdrawn",
      ],
      transport_mode: [
        "stationary",
        "walking",
        "cycling",
        "bus",
        "train",
        "driving",
        "unknown",
      ],
      verification_status: [
        "pending",
        "verified",
        "rejected",
        "expired",
        "revoked",
      ],
    },
  },
} as const
