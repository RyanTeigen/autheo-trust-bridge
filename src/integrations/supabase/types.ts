export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      anchored_hashes: {
        Row: {
          anchor_tx_url: string | null
          anchored_at: string
          created_at: string
          id: string
          record_hash: string
          record_id: string
        }
        Insert: {
          anchor_tx_url?: string | null
          anchored_at?: string
          created_at?: string
          id?: string
          record_hash: string
          record_id: string
        }
        Update: {
          anchor_tx_url?: string | null
          anchored_at?: string
          created_at?: string
          id?: string
          record_hash?: string
          record_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anchored_hashes_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "clinical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anchored_hashes_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anchored_hashes_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
      }
      anchored_logs: {
        Row: {
          anchor_tx_hash: string | null
          anchored: boolean | null
          export_type: string
          hash: string
          id: string
          initiated_by: string | null
          timestamp: string | null
        }
        Insert: {
          anchor_tx_hash?: string | null
          anchored?: boolean | null
          export_type: string
          hash: string
          id?: string
          initiated_by?: string | null
          timestamp?: string | null
        }
        Update: {
          anchor_tx_hash?: string | null
          anchored?: boolean | null
          export_type?: string
          hash?: string
          id?: string
          initiated_by?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anchored_logs_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      atomic_data_points: {
        Row: {
          created_at: string | null
          data_type: string
          enc_value: string
          id: string
          metadata: Json | null
          owner_id: string
          record_id: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_type: string
          enc_value: string
          id?: string
          metadata?: Json | null
          owner_id: string
          record_id: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_type?: string
          enc_value?: string
          id?: string
          metadata?: Json | null
          owner_id?: string
          record_id?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atomic_data_points_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "clinical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atomic_data_points_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atomic_data_points_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_anchors: {
        Row: {
          anchored_at: string
          audit_hash: string | null
          created_at: string
          id: string
          log_count: number | null
          tx_hash: string
        }
        Insert: {
          anchored_at?: string
          audit_hash?: string | null
          created_at?: string
          id?: string
          log_count?: number | null
          tx_hash: string
        }
        Update: {
          anchored_at?: string
          audit_hash?: string | null
          created_at?: string
          id?: string
          log_count?: number | null
          tx_hash?: string
        }
        Relationships: []
      }
      audit_hash_anchors: {
        Row: {
          blockchain_network: string | null
          blockchain_tx_hash: string | null
          created_at: string
          hash: string
          id: string
          log_count: number
        }
        Insert: {
          blockchain_network?: string | null
          blockchain_tx_hash?: string | null
          created_at?: string
          hash: string
          id?: string
          log_count: number
        }
        Update: {
          blockchain_network?: string | null
          blockchain_tx_hash?: string | null
          created_at?: string
          hash?: string
          id?: string
          log_count?: number
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          details: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource: string
          resource_id: string | null
          status: string | null
          target_id: string | null
          target_type: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource: string
          resource_id?: string | null
          status?: string | null
          target_id?: string | null
          target_type?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource?: string
          resource_id?: string | null
          status?: string | null
          target_id?: string | null
          target_type?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      autheo_balances: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      distributed_records: {
        Row: {
          created_at: string
          distribution_status: string
          encryption_metadata: Json | null
          id: string
          node_references: Json | null
          patient_id: string
          provider_id: string
          record_id: string
          record_type: string
          signature: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          distribution_status?: string
          encryption_metadata?: Json | null
          id?: string
          node_references?: Json | null
          patient_id: string
          provider_id: string
          record_id: string
          record_type: string
          signature?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          distribution_status?: string
          encryption_metadata?: Json | null
          id?: string
          node_references?: Json | null
          patient_id?: string
          provider_id?: string
          record_id?: string
          record_type?: string
          signature?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      enhanced_audit_logs: {
        Row: {
          action_performed: string
          after_state: Json | null
          before_state: Json | null
          compliance_flags: Json | null
          created_at: string
          details: Json | null
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id: string
          ip_address: unknown | null
          phi_accessed: boolean | null
          resource_id: string | null
          resource_type: string | null
          retention_until: string | null
          session_id: string | null
          severity: Database["public"]["Enums"]["audit_severity"]
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_performed: string
          after_state?: Json | null
          before_state?: Json | null
          compliance_flags?: Json | null
          created_at?: string
          details?: Json | null
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: unknown | null
          phi_accessed?: boolean | null
          resource_id?: string | null
          resource_type?: string | null
          retention_until?: string | null
          session_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"]
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_performed?: string
          after_state?: Json | null
          before_state?: Json | null
          compliance_flags?: Json | null
          created_at?: string
          details?: Json | null
          event_type?: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: unknown | null
          phi_accessed?: boolean | null
          resource_id?: string | null
          resource_type?: string | null
          retention_until?: string | null
          session_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"]
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fitness_access_permissions: {
        Row: {
          conditions: Json | null
          created_at: string
          data_categories: string[]
          expires_at: string | null
          granted_at: string
          granted_by: string
          granted_to_organization: string | null
          granted_to_user_id: string | null
          id: string
          permission_type: string
          purpose: string
          revoked_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          data_categories: string[]
          expires_at?: string | null
          granted_at?: string
          granted_by: string
          granted_to_organization?: string | null
          granted_to_user_id?: string | null
          id?: string
          permission_type: string
          purpose: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          data_categories?: string[]
          expires_at?: string | null
          granted_at?: string
          granted_by?: string
          granted_to_organization?: string | null
          granted_to_user_id?: string | null
          id?: string
          permission_type?: string
          purpose?: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fitness_audit_logs: {
        Row: {
          action: string
          compliance_category: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          status: string
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          compliance_category: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          status?: string
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          compliance_category?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          status?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fitness_consent_records: {
        Row: {
          consent_date: string
          consent_status: boolean
          consent_text: string
          consent_type: string
          consent_version: string
          created_at: string
          digital_signature: string | null
          expiry_date: string | null
          id: string
          ip_address: unknown | null
          updated_at: string
          user_id: string
          withdrawal_date: string | null
          witness_signature: string | null
        }
        Insert: {
          consent_date?: string
          consent_status?: boolean
          consent_text: string
          consent_type: string
          consent_version?: string
          created_at?: string
          digital_signature?: string | null
          expiry_date?: string | null
          id?: string
          ip_address?: unknown | null
          updated_at?: string
          user_id: string
          withdrawal_date?: string | null
          witness_signature?: string | null
        }
        Update: {
          consent_date?: string
          consent_status?: boolean
          consent_text?: string
          consent_type?: string
          consent_version?: string
          created_at?: string
          digital_signature?: string | null
          expiry_date?: string | null
          id?: string
          ip_address?: unknown | null
          updated_at?: string
          user_id?: string
          withdrawal_date?: string | null
          witness_signature?: string | null
        }
        Relationships: []
      }
      fitness_data: {
        Row: {
          data: Json
          data_type: string
          external_id: string | null
          id: string
          integration_id: string
          recorded_at: string
          synced_at: string
          user_id: string
        }
        Insert: {
          data: Json
          data_type: string
          external_id?: string | null
          id?: string
          integration_id: string
          recorded_at: string
          synced_at?: string
          user_id: string
        }
        Update: {
          data?: Json
          data_type?: string
          external_id?: string | null
          id?: string
          integration_id?: string
          recorded_at?: string
          synced_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fitness_data_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "fitness_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_integrations: {
        Row: {
          access_token: string | null
          athlete_id: string | null
          created_at: string
          device_type: string
          id: string
          is_connected: boolean | null
          last_sync_at: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          athlete_id?: string | null
          created_at?: string
          device_type: string
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          athlete_id?: string | null
          created_at?: string
          device_type?: string
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hash_anchor_queue: {
        Row: {
          anchor_status: string | null
          anchored_at: string | null
          blockchain_tx_hash: string | null
          error_message: string | null
          hash: string
          id: string
          patient_id: string | null
          provider_id: string | null
          queued_at: string | null
          record_id: string | null
          retry_count: number | null
        }
        Insert: {
          anchor_status?: string | null
          anchored_at?: string | null
          blockchain_tx_hash?: string | null
          error_message?: string | null
          hash: string
          id?: string
          patient_id?: string | null
          provider_id?: string | null
          queued_at?: string | null
          record_id?: string | null
          retry_count?: number | null
        }
        Update: {
          anchor_status?: string | null
          anchored_at?: string | null
          blockchain_tx_hash?: string | null
          error_message?: string | null
          hash?: string
          id?: string
          patient_id?: string | null
          provider_id?: string | null
          queued_at?: string | null
          record_id?: string | null
          retry_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hash_anchor_queue_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "clinical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hash_anchor_queue_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hash_anchor_queue_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
      }
      health_data: {
        Row: {
          created_at: string | null
          data_type: string
          id: string
          notes: string | null
          patient_id: string
          provider_id: string | null
          recorded_at: string
          unit: string
          updated_at: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          data_type: string
          id?: string
          notes?: string | null
          patient_id: string
          provider_id?: string | null
          recorded_at: string
          unit: string
          updated_at?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          data_type?: string
          id?: string
          notes?: string | null
          patient_id?: string
          provider_id?: string | null
          recorded_at?: string
          unit?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "health_data_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_data_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_reports: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      insurance_info: {
        Row: {
          created_at: string | null
          group_number: string | null
          id: string
          member_id: string
          plan_type: string | null
          provider: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          group_number?: string | null
          id?: string
          member_id: string
          plan_type?: string | null
          provider: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          group_number?: string | null
          id?: string
          member_id?: string
          plan_type?: string | null
          provider?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          anchored_at: string | null
          created_at: string | null
          encrypted_data: string
          encrypted_key: string | null
          encrypted_payload: string | null
          encryption_scheme: string | null
          id: string
          iv: string | null
          patient_id: string | null
          provider_id: string | null
          record_hash: string | null
          record_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          anchored_at?: string | null
          created_at?: string | null
          encrypted_data: string
          encrypted_key?: string | null
          encrypted_payload?: string | null
          encryption_scheme?: string | null
          id?: string
          iv?: string | null
          patient_id?: string | null
          provider_id?: string | null
          record_hash?: string | null
          record_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          anchored_at?: string | null
          created_at?: string | null
          encrypted_data?: string
          encrypted_key?: string | null
          encrypted_payload?: string | null
          encryption_scheme?: string | null
          id?: string
          iv?: string | null
          patient_id?: string | null
          provider_id?: string | null
          record_hash?: string | null
          record_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      note_access_controls: {
        Row: {
          access_level: string
          expires_at: string | null
          granted_at: string
          id: string
          note_id: string
          patient_id: string
          provider_id: string
          provider_name: string
        }
        Insert: {
          access_level: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          note_id: string
          patient_id: string
          provider_id: string
          provider_name: string
        }
        Update: {
          access_level?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          note_id?: string
          patient_id?: string
          provider_id?: string
          provider_name?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          allergies: string[] | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          id: string
          insurance_info: Json | null
          kyber_public_key: string | null
          mrn: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          id: string
          insurance_info?: Json | null
          kyber_public_key?: string | null
          mrn?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          id?: string
          insurance_info?: Json | null
          kyber_public_key?: string | null
          mrn?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_acknowledgments: {
        Row: {
          acknowledged_at: string
          created_at: string
          id: string
          ip_address: unknown | null
          policy_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          policy_version?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          policy_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          encryption_public_key: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          encryption_public_key?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          encryption_public_key?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          created_at: string | null
          id: string
          license_number: string | null
          npi: string | null
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          license_number?: string | null
          npi?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          license_number?: string | null
          npi?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      record_anchors: {
        Row: {
          anchor_hash: string
          anchored_at: string
          blockchain_tx_hash: string | null
          created_at: string
          id: string
          record_id: string
        }
        Insert: {
          anchor_hash: string
          anchored_at?: string
          blockchain_tx_hash?: string | null
          created_at?: string
          id?: string
          record_id: string
        }
        Update: {
          anchor_hash?: string
          anchored_at?: string
          blockchain_tx_hash?: string | null
          created_at?: string
          id?: string
          record_id?: string
        }
        Relationships: []
      }
      record_hashes: {
        Row: {
          hash: string
          id: string
          operation: string
          patient_id: string | null
          provider_id: string | null
          record_id: string | null
          signer_id: string | null
          timestamp: string | null
        }
        Insert: {
          hash: string
          id?: string
          operation: string
          patient_id?: string | null
          provider_id?: string | null
          record_id?: string | null
          signer_id?: string | null
          timestamp?: string | null
        }
        Update: {
          hash?: string
          id?: string
          operation?: string
          patient_id?: string | null
          provider_id?: string | null
          record_id?: string | null
          signer_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "record_hashes_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "clinical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_hashes_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_hashes_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
      }
      record_shares: {
        Row: {
          created_at: string | null
          id: string
          pq_encrypted_key: string
          record_id: string
          shared_with_user_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pq_encrypted_key: string
          record_id: string
          shared_with_user_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pq_encrypted_key?: string
          record_id?: string
          shared_with_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "record_shares_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "clinical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_shares_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_shares_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
      }
      revoked_shares: {
        Row: {
          id: string
          reason: string | null
          record_id: string
          revoked_at: string
          revoked_by: string
        }
        Insert: {
          id?: string
          reason?: string | null
          record_id: string
          revoked_at?: string
          revoked_by: string
        }
        Update: {
          id?: string
          reason?: string | null
          record_id?: string
          revoked_at?: string
          revoked_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "revoked_shares_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sharing_permissions: {
        Row: {
          created_at: string | null
          decision_note: string | null
          expires_at: string | null
          grantee_id: string
          id: string
          medical_record_id: string | null
          patient_id: string | null
          permission_type: string
          responded_at: string | null
          signed_consent: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          decision_note?: string | null
          expires_at?: string | null
          grantee_id: string
          id?: string
          medical_record_id?: string | null
          patient_id?: string | null
          permission_type: string
          responded_at?: string | null
          signed_consent?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          decision_note?: string | null
          expires_at?: string | null
          grantee_id?: string
          id?: string
          medical_record_id?: string | null
          patient_id?: string | null
          permission_type?: string
          responded_at?: string | null
          signed_consent?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sharing_permissions_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "clinical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sharing_permissions_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sharing_permissions_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sharing_permissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_contracts: {
        Row: {
          blockchain_reference: string | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          name: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          blockchain_reference?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          name: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          blockchain_reference?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      soap_notes: {
        Row: {
          assessment: string
          created_at: string | null
          decentralized_refs: Json | null
          distribution_status: string | null
          id: string
          objective: string
          patient_id: string
          plan: string
          provider_id: string
          share_with_patient: boolean | null
          subjective: string
          updated_at: string | null
          visit_date: string
        }
        Insert: {
          assessment: string
          created_at?: string | null
          decentralized_refs?: Json | null
          distribution_status?: string | null
          id?: string
          objective: string
          patient_id: string
          plan: string
          provider_id: string
          share_with_patient?: boolean | null
          subjective: string
          updated_at?: string | null
          visit_date: string
        }
        Update: {
          assessment?: string
          created_at?: string | null
          decentralized_refs?: Json | null
          distribution_status?: string | null
          id?: string
          objective?: string
          patient_id?: string
          plan?: string
          provider_id?: string
          share_with_patient?: boolean | null
          subjective?: string
          updated_at?: string | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "soap_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          autheo_coins_used: number
          created_at: string | null
          description: string | null
          fee: number
          id: string
          status: string
          transaction_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          autheo_coins_used: number
          created_at?: string | null
          description?: string | null
          fee: number
          id?: string
          status: string
          transaction_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          autheo_coins_used?: number
          created_at?: string | null
          description?: string | null
          fee?: number
          id?: string
          status?: string
          transaction_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key_type: string
          last_used_at: string | null
          public_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_type?: string
          last_used_at?: string | null
          public_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_type?: string
          last_used_at?: string | null
          public_key?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          reference_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_activity: string
          session_token: string
          terminated_at: string | null
          termination_reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          session_token: string
          terminated_at?: string | null
          termination_reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          session_token?: string
          terminated_at?: string | null
          termination_reason?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          notifications: Json
          privacy: Json
          theme: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notifications?: Json
          privacy?: Json
          theme?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notifications?: Json
          privacy?: Json
          theme?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_type: string
          id: string
          payload: Json
          record_id: string | null
          response_body: string | null
          response_status: number | null
          retry_count: number | null
          sent_at: string | null
          success: boolean | null
          webhook_url: string | null
        }
        Insert: {
          event_type: string
          id?: string
          payload: Json
          record_id?: string | null
          response_body?: string | null
          response_status?: number | null
          retry_count?: number | null
          sent_at?: string | null
          success?: boolean | null
          webhook_url?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          payload?: Json
          record_id?: string | null
          response_body?: string | null
          response_status?: number | null
          retry_count?: number | null
          sent_at?: string | null
          success?: boolean | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "clinical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_events_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_events_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      clinical_records: {
        Row: {
          anchored_at: string | null
          created_at: string | null
          encrypted_data: string | null
          id: string | null
          iv: string | null
          patient_id: string | null
          provider_id: string | null
          record_hash: string | null
          record_source: string | null
          record_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          anchored_at?: string | null
          created_at?: string | null
          encrypted_data?: string | null
          id?: string | null
          iv?: string | null
          patient_id?: string | null
          provider_id?: string | null
          record_hash?: string | null
          record_source?: never
          record_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          anchored_at?: string | null
          created_at?: string | null
          encrypted_data?: string | null
          id?: string | null
          iv?: string | null
          patient_id?: string | null
          provider_id?: string | null
          record_hash?: string | null
          record_source?: never
          record_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_records: {
        Row: {
          anchored_at: string | null
          created_at: string | null
          encrypted_data: string | null
          id: string | null
          iv: string | null
          patient_id: string | null
          provider_id: string | null
          record_hash: string | null
          record_source: string | null
          record_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          anchored_at?: string | null
          created_at?: string | null
          encrypted_data?: string | null
          id?: string | null
          iv?: string | null
          patient_id?: string | null
          provider_id?: string | null
          record_hash?: string | null
          record_source?: never
          record_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          anchored_at?: string | null
          created_at?: string | null
          encrypted_data?: string | null
          id?: string | null
          iv?: string | null
          patient_id?: string | null
          provider_id?: string | null
          record_hash?: string | null
          record_source?: never
          record_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      extend_session: {
        Args: { session_token_param: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_patient_records: {
        Args: { current_user_id: string }
        Returns: {
          id: string
          patient_id: string
          provider_id: string
          record_type: string
          encrypted_data: string
          iv: string
          created_at: string
          record_hash: string
          recipient_id: string
        }[]
      }
      get_provider_visible_records: {
        Args: { current_user_id: string }
        Returns: {
          id: string
          patient_id: string
          record_type: string
          encrypted_data: string
          created_at: string
          permission_type: string
          patient_name: string
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_wallet_address: {
        Args: { user_id: string; wallet: string }
        Returns: undefined
      }
    }
    Enums: {
      audit_event_type:
        | "login"
        | "logout"
        | "login_failed"
        | "phi_access"
        | "phi_create"
        | "phi_update"
        | "phi_delete"
        | "phi_export"
        | "permission_grant"
        | "permission_revoke"
        | "role_change"
        | "system_access"
        | "configuration_change"
        | "backup_restore"
      audit_severity: "info" | "warning" | "error" | "critical"
      user_role: "patient" | "provider" | "auditor" | "admin" | "compliance"
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
    Enums: {
      audit_event_type: [
        "login",
        "logout",
        "login_failed",
        "phi_access",
        "phi_create",
        "phi_update",
        "phi_delete",
        "phi_export",
        "permission_grant",
        "permission_revoke",
        "role_change",
        "system_access",
        "configuration_change",
        "backup_restore",
      ],
      audit_severity: ["info", "warning", "error", "critical"],
      user_role: ["patient", "provider", "auditor", "admin", "compliance"],
    },
  },
} as const
