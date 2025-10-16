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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      "135_operators_and_aircrafts": {
        Row: {
          "Aircraft Make/Model/Series": string | null
          "Certificate Designator": string | null
          "FAA Certificate Holding District Office": string | null
          "Part 135 Certificate Holder Name": string | null
          reg_norm: string | null
          "Registration Number": string | null
          "Serial Number": string | null
        }
        Insert: {
          "Aircraft Make/Model/Series"?: string | null
          "Certificate Designator"?: string | null
          "FAA Certificate Holding District Office"?: string | null
          "Part 135 Certificate Holder Name"?: string | null
          reg_norm?: string | null
          "Registration Number"?: string | null
          "Serial Number"?: string | null
        }
        Update: {
          "Aircraft Make/Model/Series"?: string | null
          "Certificate Designator"?: string | null
          "FAA Certificate Holding District Office"?: string | null
          "Part 135 Certificate Holder Name"?: string | null
          reg_norm?: string | null
          "Registration Number"?: string | null
          "Serial Number"?: string | null
        }
        Relationships: []
      }
      aircraft_bases: {
        Row: {
          base_icao: string
          confidence: number | null
          id: number
          method: string | null
          mode_s: string | null
          reg: string | null
          sample_n: number | null
          updated_at: string | null
        }
        Insert: {
          base_icao: string
          confidence?: number | null
          id?: number
          method?: string | null
          mode_s?: string | null
          reg?: string | null
          sample_n?: number | null
          updated_at?: string | null
        }
        Update: {
          base_icao?: string
          confidence?: number | null
          id?: number
          method?: string | null
          mode_s?: string | null
          reg?: string | null
          sample_n?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_briefing: {
        Row: {
          airport_icao: string
          briefing_date: string
          computed_at: string | null
          hot_hours: Json | null
          id: number
          priority_operators: Json | null
          probable_routes: Json | null
        }
        Insert: {
          airport_icao: string
          briefing_date: string
          computed_at?: string | null
          hot_hours?: Json | null
          id?: number
          priority_operators?: Json | null
          probable_routes?: Json | null
        }
        Update: {
          airport_icao?: string
          briefing_date?: string
          computed_at?: string | null
          hot_hours?: Json | null
          id?: number
          priority_operators?: Json | null
          probable_routes?: Json | null
        }
        Relationships: []
      }
      emptyleg_alerts: {
        Row: {
          channel: string
          created_at: string
          destination: string
          error: string | null
          id: number
          payload: Json
          signal_id: number
          status: string
        }
        Insert: {
          channel: string
          created_at?: string
          destination: string
          error?: string | null
          id?: number
          payload: Json
          signal_id: number
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string
          destination?: string
          error?: string | null
          id?: number
          payload?: Json
          signal_id?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "emptyleg_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "broker_feed_enriched"
            referencedColumns: ["signal_id"]
          },
          {
            foreignKeyName: "emptyleg_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "broker_feed_opportunities"
            referencedColumns: ["signal_id"]
          },
          {
            foreignKeyName: "emptyleg_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "emptyleg_signals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emptyleg_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals_board"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emptyleg_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals_board_broker_eligible"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emptyleg_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals_board_broker_publish"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emptyleg_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals_board_broker_publish_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emptyleg_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals_board_broker_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emptyleg_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals_board_with_key"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emptyleg_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals_board_with_n"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emptyleg_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals_publish_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emptyleg_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "v_alert_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emptyleg_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "v_alert_candidates_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
      emptyleg_signals: {
        Row: {
          airport_icao: string | null
          created_at: string
          dedup_key: string
          eta_arrival: string | null
          etd_next: string | null
          from_icao: string | null
          id: number
          is_ml_augmented: boolean | null
          minutes_between: number | null
          ml_features_used: Json | null
          mode_s: string | null
          prob_baseline: number | null
          prob_emptyleg: number | null
          prob_final: number | null
          prob_headsup: number | null
          prob_ml: number | null
          reason: string | null
          reg: string | null
          reg_norm: string | null
          status: string
          to_icao: string | null
        }
        Insert: {
          airport_icao?: string | null
          created_at?: string
          dedup_key: string
          eta_arrival?: string | null
          etd_next?: string | null
          from_icao?: string | null
          id?: number
          is_ml_augmented?: boolean | null
          minutes_between?: number | null
          ml_features_used?: Json | null
          mode_s?: string | null
          prob_baseline?: number | null
          prob_emptyleg?: number | null
          prob_final?: number | null
          prob_headsup?: number | null
          prob_ml?: number | null
          reason?: string | null
          reg?: string | null
          reg_norm?: string | null
          status?: string
          to_icao?: string | null
        }
        Update: {
          airport_icao?: string | null
          created_at?: string
          dedup_key?: string
          eta_arrival?: string | null
          etd_next?: string | null
          from_icao?: string | null
          id?: number
          is_ml_augmented?: boolean | null
          minutes_between?: number | null
          ml_features_used?: Json | null
          mode_s?: string | null
          prob_baseline?: number | null
          prob_emptyleg?: number | null
          prob_final?: number | null
          prob_headsup?: number | null
          prob_ml?: number | null
          reason?: string | null
          reg?: string | null
          reg_norm?: string | null
          status?: string
          to_icao?: string | null
        }
        Relationships: []
      }
      faa_aircrafts_database: {
        Row: {
          "CERT ISSUE DATE": string | null
          CERTIFICATION: string | null
          CITY: string | null
          COUNTRY: string | null
          "ENG MFR MDL": string | null
          "FRACT OWNER": string | null
          icao24_norm: string | null
          "MFR MDL CODE": string | null
          "MODE S CODE": string | null
          "MODE S CODE HEX": string | null
          n_reg_norm: string | null
          "N-NUMBER": string | null
          NAME: string | null
          "OTHER NAMES(1)": string | null
          "SERIAL NUMBER": string | null
          STATE: string | null
          "STATUS CODE": string | null
          STREET: string | null
          "TYPE AIRCRAFT": string | null
          "TYPE ENGINE": string | null
          "TYPE REGISTRANT": string | null
          "YEAR MFR": string | null
          "ZIP CODE": string | null
        }
        Insert: {
          "CERT ISSUE DATE"?: string | null
          CERTIFICATION?: string | null
          CITY?: string | null
          COUNTRY?: string | null
          "ENG MFR MDL"?: string | null
          "FRACT OWNER"?: string | null
          icao24_norm?: string | null
          "MFR MDL CODE"?: string | null
          "MODE S CODE"?: string | null
          "MODE S CODE HEX"?: string | null
          n_reg_norm?: string | null
          "N-NUMBER"?: string | null
          NAME?: string | null
          "OTHER NAMES(1)"?: string | null
          "SERIAL NUMBER"?: string | null
          STATE?: string | null
          "STATUS CODE"?: string | null
          STREET?: string | null
          "TYPE AIRCRAFT"?: string | null
          "TYPE ENGINE"?: string | null
          "TYPE REGISTRANT"?: string | null
          "YEAR MFR"?: string | null
          "ZIP CODE"?: string | null
        }
        Update: {
          "CERT ISSUE DATE"?: string | null
          CERTIFICATION?: string | null
          CITY?: string | null
          COUNTRY?: string | null
          "ENG MFR MDL"?: string | null
          "FRACT OWNER"?: string | null
          icao24_norm?: string | null
          "MFR MDL CODE"?: string | null
          "MODE S CODE"?: string | null
          "MODE S CODE HEX"?: string | null
          n_reg_norm?: string | null
          "N-NUMBER"?: string | null
          NAME?: string | null
          "OTHER NAMES(1)"?: string | null
          "SERIAL NUMBER"?: string | null
          STATE?: string | null
          "STATUS CODE"?: string | null
          STREET?: string | null
          "TYPE AIRCRAFT"?: string | null
          "TYPE ENGINE"?: string | null
          "TYPE REGISTRANT"?: string | null
          "YEAR MFR"?: string | null
          "ZIP CODE"?: string | null
        }
        Relationships: []
      }
      features_aircraft_daily: {
        Row: {
          as_of_date: string
          avg_dist_to_base_30d: number | null
          computed_at: string | null
          is_part135: boolean | null
          last_seen_at: string | null
          n_number: string
          p95_turn_mins: number | null
          rtb_rate_30d: number | null
          sample_n_30d: number | null
          turn_short_rate_30d: number | null
        }
        Insert: {
          as_of_date: string
          avg_dist_to_base_30d?: number | null
          computed_at?: string | null
          is_part135?: boolean | null
          last_seen_at?: string | null
          n_number: string
          p95_turn_mins?: number | null
          rtb_rate_30d?: number | null
          sample_n_30d?: number | null
          turn_short_rate_30d?: number | null
        }
        Update: {
          as_of_date?: string
          avg_dist_to_base_30d?: number | null
          computed_at?: string | null
          is_part135?: boolean | null
          last_seen_at?: string | null
          n_number?: string
          p95_turn_mins?: number | null
          rtb_rate_30d?: number | null
          sample_n_30d?: number | null
          turn_short_rate_30d?: number | null
        }
        Relationships: []
      }
      features_airport_daily: {
        Row: {
          as_of_date: string
          bizjet_share_30d: number | null
          computed_at: string | null
          dow_hotness: number[] | null
          hour_of_day_hotness: number[] | null
          icao: string
          short_turn_rate_30d: number | null
        }
        Insert: {
          as_of_date: string
          bizjet_share_30d?: number | null
          computed_at?: string | null
          dow_hotness?: number[] | null
          hour_of_day_hotness?: number[] | null
          icao: string
          short_turn_rate_30d?: number | null
        }
        Update: {
          as_of_date?: string
          bizjet_share_30d?: number | null
          computed_at?: string | null
          dow_hotness?: number[] | null
          hour_of_day_hotness?: number[] | null
          icao?: string
          short_turn_rate_30d?: number | null
        }
        Relationships: []
      }
      features_route_daily: {
        Row: {
          arr_icao: string
          as_of_date: string
          computed_at: string | null
          dep_icao: string
          median_block_time_mins: number | null
          rtb_rate_30d: number | null
          sample_n_30d: number | null
          short_turn_rate_30d: number | null
        }
        Insert: {
          arr_icao: string
          as_of_date: string
          computed_at?: string | null
          dep_icao: string
          median_block_time_mins?: number | null
          rtb_rate_30d?: number | null
          sample_n_30d?: number | null
          short_turn_rate_30d?: number | null
        }
        Update: {
          arr_icao?: string
          as_of_date?: string
          computed_at?: string | null
          dep_icao?: string
          median_block_time_mins?: number | null
          rtb_rate_30d?: number | null
          sample_n_30d?: number | null
          short_turn_rate_30d?: number | null
        }
        Relationships: []
      }
      flights_canonical: {
        Row: {
          aircraft_mode_s: string | null
          aircraft_model: string | null
          aircraft_reg: string | null
          arr_icao: string | null
          arr_status: string | null
          arr_time_local: string | null
          arr_time_utc: string | null
          call_sign: string | null
          dep_icao: string | null
          dep_status: string | null
          dep_time_local: string | null
          dep_time_utc: string | null
          flight_uid: string
          source: string | null
          updated_at: string | null
        }
        Insert: {
          aircraft_mode_s?: string | null
          aircraft_model?: string | null
          aircraft_reg?: string | null
          arr_icao?: string | null
          arr_status?: string | null
          arr_time_local?: string | null
          arr_time_utc?: string | null
          call_sign?: string | null
          dep_icao?: string | null
          dep_status?: string | null
          dep_time_local?: string | null
          dep_time_utc?: string | null
          flight_uid: string
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          aircraft_mode_s?: string | null
          aircraft_model?: string | null
          aircraft_reg?: string | null
          arr_icao?: string | null
          arr_status?: string | null
          arr_time_local?: string | null
          arr_time_utc?: string | null
          call_sign?: string | null
          dep_icao?: string | null
          dep_status?: string | null
          dep_time_local?: string | null
          dep_time_utc?: string | null
          flight_uid?: string
          source?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      flights_events: {
        Row: {
          aircraft_mode_s: string | null
          aircraft_model: string | null
          aircraft_reg: string | null
          aircraft_reg_norm: string | null
          airport_arr_icao: string | null
          airport_dep_icao: string | null
          best_time_utc: string | null
          call_sign: string | null
          created_at: string
          event_kind: string | null
          flight_number: string | null
          flight_uid: string | null
          id: number
          raw: Json | null
          revised_time_local: string | null
          revised_time_utc: string | null
          runway_time_local: string | null
          runway_time_utc: string | null
          scheduled_time_local: string | null
          scheduled_time_utc: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          aircraft_mode_s?: string | null
          aircraft_model?: string | null
          aircraft_reg?: string | null
          aircraft_reg_norm?: string | null
          airport_arr_icao?: string | null
          airport_dep_icao?: string | null
          best_time_utc?: string | null
          call_sign?: string | null
          created_at?: string
          event_kind?: string | null
          flight_number?: string | null
          flight_uid?: string | null
          id?: number
          raw?: Json | null
          revised_time_local?: string | null
          revised_time_utc?: string | null
          runway_time_local?: string | null
          runway_time_utc?: string | null
          scheduled_time_local?: string | null
          scheduled_time_utc?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          aircraft_mode_s?: string | null
          aircraft_model?: string | null
          aircraft_reg?: string | null
          aircraft_reg_norm?: string | null
          airport_arr_icao?: string | null
          airport_dep_icao?: string | null
          best_time_utc?: string | null
          call_sign?: string | null
          created_at?: string
          event_kind?: string | null
          flight_number?: string | null
          flight_uid?: string | null
          id?: number
          raw?: Json | null
          revised_time_local?: string | null
          revised_time_utc?: string | null
          runway_time_local?: string | null
          runway_time_utc?: string | null
          scheduled_time_local?: string | null
          scheduled_time_utc?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
      flights_raw: {
        Row: {
          airport_icao: string
          dedup_key: string
          direction: string
          fetched_at: string
          id: number
          payload: Json
          source: string
          window_from_utc: string | null
          window_to_utc: string | null
        }
        Insert: {
          airport_icao: string
          dedup_key: string
          direction: string
          fetched_at?: string
          id?: number
          payload: Json
          source?: string
          window_from_utc?: string | null
          window_to_utc?: string | null
        }
        Update: {
          airport_icao?: string
          dedup_key?: string
          direction?: string
          fetched_at?: string
          id?: number
          payload?: Json
          source?: string
          window_from_utc?: string | null
          window_to_utc?: string | null
        }
        Relationships: []
      }
      ingest_logs: {
        Row: {
          airport_icao: string
          created_at: string
          function_name: string
          id: string
          latency_ms: number
          message: string | null
          rows_written: number
          status_code: number
          ts: string
        }
        Insert: {
          airport_icao: string
          created_at?: string
          function_name?: string
          id?: string
          latency_ms?: number
          message?: string | null
          rows_written?: number
          status_code: number
          ts?: string
        }
        Update: {
          airport_icao?: string
          created_at?: string
          function_name?: string
          id?: string
          latency_ms?: number
          message?: string | null
          rows_written?: number
          status_code?: number
          ts?: string
        }
        Relationships: []
      }
      ml_models: {
        Row: {
          algo: string
          bias: number
          id: number
          is_active: boolean
          metrics: Json | null
          name: string
          trained_at: string
          version: string
          weights: Json
        }
        Insert: {
          algo?: string
          bias: number
          id?: number
          is_active?: boolean
          metrics?: Json | null
          name: string
          trained_at?: string
          version: string
          weights: Json
        }
        Update: {
          algo?: string
          bias?: number
          id?: number
          is_active?: boolean
          metrics?: Json | null
          name?: string
          trained_at?: string
          version?: string
          weights?: Json
        }
        Relationships: []
      }
      ml_training_labels: {
        Row: {
          airport_icao: string
          created_at: string | null
          dist_to_base_nm: number | null
          flight_uid: string
          id: number
          is_to_base: boolean | null
          label_binary: boolean | null
          label_confidence: number | null
          n_number: string | null
          next_to_icao: string | null
          turn_mins: number | null
        }
        Insert: {
          airport_icao: string
          created_at?: string | null
          dist_to_base_nm?: number | null
          flight_uid: string
          id?: number
          is_to_base?: boolean | null
          label_binary?: boolean | null
          label_confidence?: number | null
          n_number?: string | null
          next_to_icao?: string | null
          turn_mins?: number | null
        }
        Update: {
          airport_icao?: string
          created_at?: string | null
          dist_to_base_nm?: number | null
          flight_uid?: string
          id?: number
          is_to_base?: boolean | null
          label_binary?: boolean | null
          label_confidence?: number | null
          n_number?: string | null
          next_to_icao?: string | null
          turn_mins?: number | null
        }
        Relationships: []
      }
      operator_contacts: {
        Row: {
          created_at: string | null
          email_sales: string | null
          id: number
          last_verified_at: string | null
          notes: string | null
          operator_name: string
          phone_sales: string | null
          source: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          email_sales?: string | null
          id?: number
          last_verified_at?: string | null
          notes?: string | null
          operator_name: string
          phone_sales?: string | null
          source?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          email_sales?: string | null
          id?: number
          last_verified_at?: string | null
          notes?: string | null
          operator_name?: string
          phone_sales?: string | null
          source?: string | null
          website?: string | null
        }
        Relationships: []
      }
      operator_intelligence: {
        Row: {
          active_tails: Json | null
          best_call_time: string | null
          computed_at: string | null
          footprint_airports: Json | null
          hot_hours: Json | null
          operator_name: string
          rtb_patterns: Json | null
          top_routes: Json | null
        }
        Insert: {
          active_tails?: Json | null
          best_call_time?: string | null
          computed_at?: string | null
          footprint_airports?: Json | null
          hot_hours?: Json | null
          operator_name: string
          rtb_patterns?: Json | null
          top_routes?: Json | null
        }
        Update: {
          active_tails?: Json | null
          best_call_time?: string | null
          computed_at?: string | null
          footprint_airports?: Json | null
          hot_hours?: Json | null
          operator_name?: string
          rtb_patterns?: Json | null
          top_routes?: Json | null
        }
        Relationships: []
      }
      ourairports: {
        Row: {
          continent: string | null
          elevation_ft: string | null
          gps_code: string | null
          home_link: string | null
          iata_code: string | null
          icao_code: string | null
          id: number | null
          ident: string | null
          iso_country: string | null
          iso_region: string | null
          keywords: string | null
          latitude_deg: number | null
          local_code: string | null
          longitude_deg: number | null
          municipality: string | null
          name: string | null
          scheduled_service: string | null
          type: string | null
          tz_database_time_zone: string | null
          wikipedia_link: string | null
        }
        Insert: {
          continent?: string | null
          elevation_ft?: string | null
          gps_code?: string | null
          home_link?: string | null
          iata_code?: string | null
          icao_code?: string | null
          id?: number | null
          ident?: string | null
          iso_country?: string | null
          iso_region?: string | null
          keywords?: string | null
          latitude_deg?: number | null
          local_code?: string | null
          longitude_deg?: number | null
          municipality?: string | null
          name?: string | null
          scheduled_service?: string | null
          type?: string | null
          tz_database_time_zone?: string | null
          wikipedia_link?: string | null
        }
        Update: {
          continent?: string | null
          elevation_ft?: string | null
          gps_code?: string | null
          home_link?: string | null
          iata_code?: string | null
          icao_code?: string | null
          id?: number | null
          ident?: string | null
          iso_country?: string | null
          iso_region?: string | null
          keywords?: string | null
          latitude_deg?: number | null
          local_code?: string | null
          longitude_deg?: number | null
          municipality?: string | null
          name?: string | null
          scheduled_service?: string | null
          type?: string | null
          tz_database_time_zone?: string | null
          wikipedia_link?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          airports: string[] | null
          created_at: string
          id: string
          notify_email: string | null
          notify_slack_webhook: string | null
          prob_threshold: number | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          airports?: string[] | null
          created_at?: string
          id?: string
          notify_email?: string | null
          notify_slack_webhook?: string | null
          prob_threshold?: number | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          airports?: string[] | null
          created_at?: string
          id?: string
          notify_email?: string | null
          notify_slack_webhook?: string | null
          prob_threshold?: number | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watch_airports: {
        Row: {
          active: boolean | null
          direction: string | null
          duration_minutes: number | null
          enabled: boolean | null
          icao: string
          label: string | null
          last_run: string | null
          latitude_deg: number | null
          longitude_deg: number | null
          name: string | null
          notes: string | null
          offset_minutes: number | null
          tz: string | null
        }
        Insert: {
          active?: boolean | null
          direction?: string | null
          duration_minutes?: number | null
          enabled?: boolean | null
          icao: string
          label?: string | null
          last_run?: string | null
          latitude_deg?: number | null
          longitude_deg?: number | null
          name?: string | null
          notes?: string | null
          offset_minutes?: number | null
          tz?: string | null
        }
        Update: {
          active?: boolean | null
          direction?: string | null
          duration_minutes?: number | null
          enabled?: boolean | null
          icao?: string
          label?: string | null
          last_run?: string | null
          latitude_deg?: number | null
          longitude_deg?: number | null
          name?: string | null
          notes?: string | null
          offset_minutes?: number | null
          tz?: string | null
        }
        Relationships: []
      }
      watchlists: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          kind: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          kind: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          kind?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      airports_watch: {
        Row: {
          airport_icao: string | null
          direction: string | null
          duration_minutes: number | null
          enabled: boolean | null
          label: string | null
          offset_minutes: number | null
        }
        Insert: {
          airport_icao?: string | null
          direction?: string | null
          duration_minutes?: number | null
          enabled?: boolean | null
          label?: string | null
          offset_minutes?: number | null
        }
        Update: {
          airport_icao?: string | null
          direction?: string | null
          duration_minutes?: number | null
          enabled?: boolean | null
          label?: string | null
          offset_minutes?: number | null
        }
        Relationships: []
      }
      broker_feed: {
        Row: {
          aircraft_model: string | null
          airport_arr_icao: string | null
          airport_dep_icao: string | null
          call_sign: string | null
          etd_utc: string | null
          flight_number: string | null
          id: number | null
          n_number: string | null
          operator_count: number | null
          operator_primary: string | null
        }
        Relationships: []
      }
      broker_feed_enriched: {
        Row: {
          aircraft_model: string | null
          arr_icao: string | null
          broker_feed_id: number | null
          call_sign: string | null
          dep_icao: string | null
          etd_utc: string | null
          flight_number: string | null
          minutes_between: number | null
          n_number: string | null
          operator_count: number | null
          operator_primary: string | null
          prob_baseline: number | null
          prob_final: number | null
          prob_ml: number | null
          reason: string | null
          signal_id: number | null
          status: string | null
        }
        Relationships: []
      }
      broker_feed_opportunities: {
        Row: {
          aircraft_model: string | null
          arr_icao: string | null
          broker_feed_id: number | null
          call_sign: string | null
          dep_icao: string | null
          etd_utc: string | null
          flight_number: string | null
          minutes_between: number | null
          n_number: string | null
          operator_count: number | null
          operator_primary: string | null
          prob_baseline: number | null
          prob_final: number | null
          prob_ml: number | null
          reason: string | null
          signal_id: number | null
          status: string | null
        }
        Relationships: []
      }
      charter_eligible_tails: {
        Row: {
          n_number: string | null
          operator_names: string[] | null
          operator_primary: string | null
        }
        Relationships: []
      }
      events_bizjet_candidates: {
        Row: {
          aircraft_model: string | null
          id: number | null
          is_bizjet_candidate: boolean | null
          is_cargo: boolean | null
          is_part135_known: boolean | null
          mdl_is_airline: boolean | null
          mdl_is_biz: boolean | null
          n_number_norm: string | null
          op_is_airline: boolean | null
          operator_primary: string | null
        }
        Relationships: []
      }
      flights_events_view: {
        Row: {
          aircraft_model: string | null
          airport_icao: string | null
          arr_icao: string | null
          arr_rev_utc: string | null
          arr_rw_utc: string | null
          arr_sched_utc: string | null
          call_sign: string | null
          dep_icao: string | null
          dep_rev_utc: string | null
          dep_rw_utc: string | null
          dep_sched_utc: string | null
          direction: string | null
          fetched_at: string | null
          flight_number: string | null
          icao24: string | null
          item: Json | null
          operator_code: string | null
          operator_name: string | null
          raw_id: number | null
          reg: string | null
          status: string | null
        }
        Relationships: []
      }
      flights_with_n: {
        Row: {
          aircraft_mode_s: string | null
          aircraft_model: string | null
          aircraft_reg: string | null
          aircraft_reg_norm: string | null
          airport_arr_icao: string | null
          airport_dep_icao: string | null
          best_time_utc: string | null
          call_sign: string | null
          created_at: string | null
          event_kind: string | null
          flight_number: string | null
          flight_uid: string | null
          id: number | null
          n_number_norm: string | null
          raw: Json | null
          revised_time_local: string | null
          revised_time_utc: string | null
          runway_time_local: string | null
          runway_time_utc: string | null
          scheduled_time_local: string | null
          scheduled_time_utc: string | null
          source: string | null
          status: string | null
        }
        Relationships: []
      }
      legs_90d: {
        Row: {
          arr_icao: string | null
          arr_time_utc: string | null
          dep_icao: string | null
          dep_time_utc: string | null
          flight_uid: string | null
          mode_s: string | null
          n_number: string | null
        }
        Relationships: []
      }
      operator_airport_intel_30d: {
        Row: {
          airport_icao: string | null
          flights_30d: number | null
          median_block_mins: number | null
          operator_primary: string | null
          rtb_rate_24h: number | null
          short_turn_rate_30d: number | null
        }
        Relationships: []
      }
      operator_corridor_intel_30d: {
        Row: {
          arr_icao: string | null
          dep_icao: string | null
          fill_score: number | null
          flights_30d: number | null
          last_seen: string | null
          operator_primary: string | null
          short_turn_rate: number | null
        }
        Relationships: []
      }
      operator_route_intel_90d: {
        Row: {
          arr_icao: string | null
          dep_icao: string | null
          dow_hist_90d: Json | null
          flights_90d: number | null
          hod_hist_90d: Json | null
          median_block_mins: number | null
          operator_primary: string | null
        }
        Relationships: []
      }
      pairs_30d_mv: {
        Row: {
          airport_icao: string | null
          arr_time_utc: string | null
          arr_uid: string | null
          dep_icao: string | null
          dep_time_utc: string | null
          dep_uid: string | null
          mode_s: string | null
          n_number: string | null
          next_arr_icao: string | null
          turn_mins: number | null
        }
        Relationships: []
      }
      patterns_hot_hours_by_airport: {
        Row: {
          as_of_date: string | null
          bizjet_share_30d: number | null
          dow_hotness: number[] | null
          hour_of_day_hotness: number[] | null
          icao: string | null
          short_turn_rate_30d: number | null
          top_hours_utc: number[] | null
        }
        Relationships: []
      }
      patterns_hot_routes_auto: {
        Row: {
          arr_icao: string | null
          as_of_date: string | null
          dep_icao: string | null
          hot_score: number | null
          median_block_time_mins: number | null
          rk_dep: number | null
          rtb_rate_30d: number | null
          sample_n_30d: number | null
          short_turn_rate_30d: number | null
        }
        Relationships: []
      }
      patterns_operator_coverage: {
        Row: {
          last_seen_at: string | null
          n_number: string | null
          operator_count: number | null
          operator_primary: string | null
          rtb_rate_30d: number | null
          sample_n_30d: number | null
          turn_short_rate_30d: number | null
        }
        Relationships: []
      }
      patterns_rtb_routes: {
        Row: {
          arr_icao: string | null
          as_of_date: string | null
          dep_icao: string | null
          median_block_time_mins: number | null
          rtb_rate_30d: number | null
          sample_n_30d: number | null
          short_turn_rate_30d: number | null
        }
        Relationships: []
      }
      patterns_tail_habits: {
        Row: {
          as_of_date: string | null
          avg_dist_to_base_30d: number | null
          is_part135: boolean | null
          last_seen_at: string | null
          n_number: string | null
          p95_turn_mins: number | null
          rtb_rate_30d: number | null
          sample_n_30d: number | null
          turn_short_rate_30d: number | null
        }
        Relationships: []
      }
      prospect_shortlist_by_corridor: {
        Row: {
          arr_icao: string | null
          dep_icao: string | null
          fill_score: number | null
          flights_30d: number | null
          last_seen: string | null
          operator_primary: string | null
          short_turn_rate: number | null
        }
        Relationships: []
      }
      signals_board: {
        Row: {
          created_at: string | null
          eta_arrival: string | null
          etd_next: string | null
          from_icao: string | null
          id: number | null
          prob_emptyleg: number | null
          prob_headsup: number | null
          reason: string | null
          reg: string | null
          status: string | null
          to_icao: string | null
        }
        Insert: {
          created_at?: string | null
          eta_arrival?: string | null
          etd_next?: string | null
          from_icao?: string | null
          id?: number | null
          prob_emptyleg?: number | null
          prob_headsup?: number | null
          reason?: string | null
          reg?: string | null
          status?: string | null
          to_icao?: string | null
        }
        Update: {
          created_at?: string | null
          eta_arrival?: string | null
          etd_next?: string | null
          from_icao?: string | null
          id?: number | null
          prob_emptyleg?: number | null
          prob_headsup?: number | null
          reason?: string | null
          reg?: string | null
          status?: string | null
          to_icao?: string | null
        }
        Relationships: []
      }
      signals_board_broker_eligible: {
        Row: {
          created_at: string | null
          eta_arrival: string | null
          etd_next: string | null
          from_icao: string | null
          id: number | null
          operator_count: number | null
          operator_primary: string | null
          prob_emptyleg: number | null
          prob_headsup: number | null
          reason: string | null
          reg: string | null
          reg_norm: string | null
          status: string | null
          to_icao: string | null
        }
        Relationships: []
      }
      signals_board_broker_publish: {
        Row: {
          eta_arrival: string | null
          etd_next: string | null
          id: number | null
          n_number: string | null
          operator_primary: string | null
          prob_emptyleg: number | null
          prob_headsup: number | null
          reason: string | null
          to_icao: string | null
        }
        Relationships: []
      }
      signals_board_broker_publish_mv: {
        Row: {
          eta_arrival: string | null
          etd_minute: string | null
          etd_next: string | null
          id: number | null
          n_number: string | null
          operator_primary: string | null
          prob_emptyleg: number | null
          prob_headsup: number | null
          reason: string | null
          to_icao: string | null
        }
        Relationships: []
      }
      signals_board_broker_status: {
        Row: {
          created_at: string | null
          eligibility_reason: string | null
          eta_arrival: string | null
          etd_next: string | null
          from_icao: string | null
          id: number | null
          n_number_fallback: string | null
          n_number_norm: string | null
          operator_count: number | null
          operator_primary: string | null
          prob_emptyleg: number | null
          prob_headsup: number | null
          reason: string | null
          reg: string | null
          reg_norm: string | null
          status: string | null
          to_icao: string | null
        }
        Relationships: []
      }
      signals_board_with_key: {
        Row: {
          created_at: string | null
          dedup_key: string | null
          eta_arrival: string | null
          etd_next: string | null
          from_icao: string | null
          id: number | null
          prob_emptyleg: number | null
          prob_headsup: number | null
          reason: string | null
          reg: string | null
          status: string | null
          to_icao: string | null
        }
        Insert: {
          created_at?: string | null
          dedup_key?: never
          eta_arrival?: string | null
          etd_next?: string | null
          from_icao?: string | null
          id?: number | null
          prob_emptyleg?: number | null
          prob_headsup?: number | null
          reason?: string | null
          reg?: string | null
          status?: string | null
          to_icao?: string | null
        }
        Update: {
          created_at?: string | null
          dedup_key?: never
          eta_arrival?: string | null
          etd_next?: string | null
          from_icao?: string | null
          id?: number | null
          prob_emptyleg?: number | null
          prob_headsup?: number | null
          reason?: string | null
          reg?: string | null
          status?: string | null
          to_icao?: string | null
        }
        Relationships: []
      }
      signals_board_with_n: {
        Row: {
          created_at: string | null
          eta_arrival: string | null
          etd_next: string | null
          from_icao: string | null
          id: number | null
          n_number_fallback: string | null
          n_number_norm: string | null
          prob_emptyleg: number | null
          prob_headsup: number | null
          reason: string | null
          reg: string | null
          reg_norm: string | null
          status: string | null
          to_icao: string | null
        }
        Relationships: []
      }
      signals_publish_enriched: {
        Row: {
          aircraft_model: string | null
          eta_arrival: string | null
          etd_minute: string | null
          etd_next: string | null
          from_icao: string | null
          id: number | null
          n_number: string | null
          operator_primary: string | null
          prob_emptyleg: number | null
          prob_headsup: number | null
          reason: string | null
          to_icao: string | null
        }
        Relationships: []
      }
      tail_operator_map_mv: {
        Row: {
          certificate_designators: string[] | null
          n_number: string | null
          operator_names: string[] | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_alert_candidates: {
        Row: {
          airport_icao: string | null
          created_at: string | null
          dedup_key: string | null
          eta_arrival: string | null
          etd_next: string | null
          from_icao: string | null
          id: number | null
          minutes_between: number | null
          mode_s: string | null
          prob_emptyleg: number | null
          prob_headsup: number | null
          reason: string | null
          reg: string | null
          status: string | null
          to_icao: string | null
        }
        Insert: {
          airport_icao?: string | null
          created_at?: string | null
          dedup_key?: string | null
          eta_arrival?: string | null
          etd_next?: string | null
          from_icao?: string | null
          id?: number | null
          minutes_between?: number | null
          mode_s?: string | null
          prob_emptyleg?: number | null
          prob_headsup?: number | null
          reason?: string | null
          reg?: string | null
          status?: string | null
          to_icao?: string | null
        }
        Update: {
          airport_icao?: string | null
          created_at?: string | null
          dedup_key?: string | null
          eta_arrival?: string | null
          etd_next?: string | null
          from_icao?: string | null
          id?: number | null
          minutes_between?: number | null
          mode_s?: string | null
          prob_emptyleg?: number | null
          prob_headsup?: number | null
          reason?: string | null
          reg?: string | null
          status?: string | null
          to_icao?: string | null
        }
        Relationships: []
      }
      v_alert_candidates_enriched: {
        Row: {
          airport_icao: string | null
          created_at: string | null
          dedup_key: string | null
          eta_arrival: string | null
          etd_next: string | null
          from_icao: string | null
          id: number | null
          minutes_between: number | null
          mode_s: string | null
          operator_primary: string | null
          prob_emptyleg: number | null
          prob_headsup: number | null
          reason: string | null
          reg: string | null
          reg_raw: string | null
          status: string | null
          to_icao: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      norm_n: {
        Args: { t: string }
        Returns: string
      }
      refresh_intel_matviews: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_mv_signals_publish: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
