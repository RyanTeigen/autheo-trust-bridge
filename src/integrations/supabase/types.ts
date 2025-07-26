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
      access_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          log_timestamp: string | null
          patient_id: string | null
          provider_id: string | null
          record_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          log_timestamp?: string | null
          patient_id?: string | null
          provider_id?: string | null
          record_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          log_timestamp?: string | null
          patient_id?: string | null
          provider_id?: string | null
          record_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "clinical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
      }
      access_request_audit: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          new_status: string | null
          notes: string | null
          old_status: string | null
          performed_by: string | null
          request_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          performed_by?: string | null
          request_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          performed_by?: string | null
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_request_audit_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_request_audit_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "sharing_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      administrative_safeguards: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string
          due_date: string | null
          evidence_location: string | null
          id: string
          implementation_status: string
          last_reviewed: string | null
          next_review_due: string | null
          review_frequency: unknown | null
          safeguard_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description: string
          due_date?: string | null
          evidence_location?: string | null
          id?: string
          implementation_status?: string
          last_reviewed?: string | null
          next_review_due?: string | null
          review_frequency?: unknown | null
          safeguard_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string
          due_date?: string | null
          evidence_location?: string | null
          id?: string
          implementation_status?: string
          last_reviewed?: string | null
          next_review_due?: string | null
          review_frequency?: unknown | null
          safeguard_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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
      appointment_access_mappings: {
        Row: {
          access_duration_hours: number | null
          access_expires_at: string | null
          access_granted: boolean | null
          appointment_id: string
          auto_granted: boolean | null
          clinical_justification: string | null
          created_at: string | null
          id: string
          patient_id: string
          provider_id: string
          updated_at: string | null
        }
        Insert: {
          access_duration_hours?: number | null
          access_expires_at?: string | null
          access_granted?: boolean | null
          appointment_id: string
          auto_granted?: boolean | null
          clinical_justification?: string | null
          created_at?: string | null
          id?: string
          patient_id: string
          provider_id: string
          updated_at?: string | null
        }
        Update: {
          access_duration_hours?: number | null
          access_expires_at?: string | null
          access_granted?: boolean | null
          appointment_id?: string
          auto_granted?: boolean | null
          clinical_justification?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string
          provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_access_mappings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_audit_trail: {
        Row: {
          action: string
          appointment_id: string | null
          details: Json | null
          id: string
          mapping_id: string | null
          performed_by: string
          timestamp: string | null
        }
        Insert: {
          action: string
          appointment_id?: string | null
          details?: Json | null
          id?: string
          mapping_id?: string | null
          performed_by: string
          timestamp?: string | null
        }
        Update: {
          action?: string
          appointment_id?: string | null
          details?: Json | null
          id?: string
          mapping_id?: string | null
          performed_by?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_audit_trail_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "enhanced_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_audit_trail_mapping_id_fkey"
            columns: ["mapping_id"]
            isOneToOne: false
            referencedRelation: "appointment_access_mappings"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_data_type_mappings: {
        Row: {
          access_justification: string | null
          appointment_type: string
          created_at: string | null
          id: string
          priority_level: string | null
          required_data_types: string[]
          updated_at: string | null
        }
        Insert: {
          access_justification?: string | null
          appointment_type: string
          created_at?: string | null
          id?: string
          priority_level?: string | null
          required_data_types?: string[]
          updated_at?: string | null
        }
        Update: {
          access_justification?: string | null
          appointment_type?: string
          created_at?: string | null
          id?: string
          priority_level?: string | null
          required_data_types?: string[]
          updated_at?: string | null
        }
        Relationships: []
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
          access_purpose: string | null
          action: string
          data_categories: string[] | null
          details: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          minimum_necessary_justification: string | null
          phi_accessed: boolean | null
          resource: string
          resource_id: string | null
          retention_period: unknown | null
          status: string | null
          target_id: string | null
          target_type: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_purpose?: string | null
          action: string
          data_categories?: string[] | null
          details?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          minimum_necessary_justification?: string | null
          phi_accessed?: boolean | null
          resource: string
          resource_id?: string | null
          retention_period?: unknown | null
          status?: string | null
          target_id?: string | null
          target_type?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_purpose?: string | null
          action?: string
          data_categories?: string[] | null
          details?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          minimum_necessary_justification?: string | null
          phi_accessed?: boolean | null
          resource?: string
          resource_id?: string | null
          retention_period?: unknown | null
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
      breach_detection_events: {
        Row: {
          auto_detected: boolean | null
          created_at: string | null
          description: string
          event_type: string
          id: string
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_id: string | null
        }
        Insert: {
          auto_detected?: boolean | null
          created_at?: string | null
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          user_id?: string | null
        }
        Update: {
          auto_detected?: boolean | null
          created_at?: string | null
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      business_associate_agreements: {
        Row: {
          agreement_expiry_date: string | null
          agreement_signed_date: string | null
          agreement_type: string
          breach_notification_requirements: Json | null
          compliance_status: string
          created_at: string | null
          created_by: string | null
          document_location: string | null
          id: string
          last_audit_date: string | null
          next_audit_date: string | null
          notes: string | null
          phi_access_level: string
          renewal_required: boolean | null
          security_requirements: Json | null
          services_provided: string
          termination_procedures: Json | null
          updated_at: string | null
          vendor_contact_email: string | null
          vendor_name: string
        }
        Insert: {
          agreement_expiry_date?: string | null
          agreement_signed_date?: string | null
          agreement_type: string
          breach_notification_requirements?: Json | null
          compliance_status?: string
          created_at?: string | null
          created_by?: string | null
          document_location?: string | null
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          notes?: string | null
          phi_access_level: string
          renewal_required?: boolean | null
          security_requirements?: Json | null
          services_provided: string
          termination_procedures?: Json | null
          updated_at?: string | null
          vendor_contact_email?: string | null
          vendor_name: string
        }
        Update: {
          agreement_expiry_date?: string | null
          agreement_signed_date?: string | null
          agreement_type?: string
          breach_notification_requirements?: Json | null
          compliance_status?: string
          created_at?: string | null
          created_by?: string | null
          document_location?: string | null
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          notes?: string | null
          phi_access_level?: string
          renewal_required?: boolean | null
          security_requirements?: Json | null
          services_provided?: string
          termination_procedures?: Json | null
          updated_at?: string | null
          vendor_contact_email?: string | null
          vendor_name?: string
        }
        Relationships: []
      }
      compliance_metrics_history: {
        Row: {
          category: string
          created_at: string
          id: string
          measured_at: string
          metric_type: string
          metric_unit: string | null
          metric_value: number
          subcategory: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          measured_at?: string
          metric_type: string
          metric_unit?: string | null
          metric_value: number
          subcategory?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          measured_at?: string
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number
          subcategory?: string | null
        }
        Relationships: []
      }
      compliance_policies: {
        Row: {
          acknowledgment_required: boolean | null
          approval_date: string | null
          approved_by: string | null
          auto_assignment_rules: Json | null
          content: Json
          created_at: string | null
          created_by: string | null
          description: string
          effective_date: string | null
          id: string
          policy_id: string
          policy_type: string
          review_date: string | null
          status: string
          title: string
          updated_at: string | null
          version: string
        }
        Insert: {
          acknowledgment_required?: boolean | null
          approval_date?: string | null
          approved_by?: string | null
          auto_assignment_rules?: Json | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          description: string
          effective_date?: string | null
          id?: string
          policy_id: string
          policy_type: string
          review_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
          version?: string
        }
        Update: {
          acknowledgment_required?: boolean | null
          approval_date?: string | null
          approved_by?: string | null
          auto_assignment_rules?: Json | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string
          effective_date?: string | null
          id?: string
          policy_id?: string
          policy_type?: string
          review_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      compliance_violations: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string
          detected_at: string | null
          id: string
          remediation_steps: Json | null
          resolution_notes: string | null
          resolved_at: string | null
          resource_id: string | null
          resource_type: string | null
          severity: string
          source: string
          status: string | null
          updated_at: string | null
          user_id: string | null
          violation_type: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description: string
          detected_at?: string | null
          id?: string
          remediation_steps?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity: string
          source: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          violation_type: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          detected_at?: string | null
          id?: string
          remediation_steps?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          source?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          violation_type?: string
        }
        Relationships: []
      }
      consent_revocations: {
        Row: {
          anchored: boolean | null
          anchored_at: string | null
          blockchain_tx_hash: string | null
          consent_id: string
          created_at: string
          id: string
          reason: string | null
          revocation_hash: string
          revoked_at: string
          revoked_by: string
          updated_at: string
        }
        Insert: {
          anchored?: boolean | null
          anchored_at?: string | null
          blockchain_tx_hash?: string | null
          consent_id: string
          created_at?: string
          id?: string
          reason?: string | null
          revocation_hash: string
          revoked_at?: string
          revoked_by: string
          updated_at?: string
        }
        Update: {
          anchored?: boolean | null
          anchored_at?: string | null
          blockchain_tx_hash?: string | null
          consent_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          revocation_hash?: string
          revoked_at?: string
          revoked_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_revocations_consent_id_fkey"
            columns: ["consent_id"]
            isOneToOne: false
            referencedRelation: "consents"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          created_at: string
          data_types: string[]
          duration: unknown | null
          id: string
          requester: string
          revoked: boolean
          revoked_at: string | null
          timestamp: string
          tx_id: string | null
          updated_at: string
          user_did: string
        }
        Insert: {
          created_at?: string
          data_types: string[]
          duration?: unknown | null
          id?: string
          requester: string
          revoked?: boolean
          revoked_at?: string | null
          timestamp?: string
          tx_id?: string | null
          updated_at?: string
          user_did: string
        }
        Update: {
          created_at?: string
          data_types?: string[]
          duration?: unknown | null
          id?: string
          requester?: string
          revoked?: boolean
          revoked_at?: string | null
          timestamp?: string
          tx_id?: string | null
          updated_at?: string
          user_did?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          patient_id: string
          provider_id: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          patient_id: string
          provider_id: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          patient_id?: string
          provider_id?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversations_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_provider"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      critical_medical_updates: {
        Row: {
          acknowledged_at: string | null
          acknowledgment_required: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          patient_id: string
          provider_id: string
          related_record_id: string | null
          requires_immediate_attention: boolean | null
          severity_level: string
          title: string
          update_type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledgment_required?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          patient_id: string
          provider_id: string
          related_record_id?: string | null
          requires_immediate_attention?: boolean | null
          severity_level?: string
          title: string
          update_type: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledgment_required?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          patient_id?: string
          provider_id?: string
          related_record_id?: string | null
          requires_immediate_attention?: boolean | null
          severity_level?: string
          title?: string
          update_type?: string
        }
        Relationships: []
      }
      cross_hospital_requests: {
        Row: {
          audit_trail: Json | null
          clinical_justification: string
          created_at: string
          data_shared_at: string | null
          expires_at: string | null
          id: string
          inter_hospital_approved: boolean | null
          inter_hospital_approved_at: string | null
          patient_consent_at: string | null
          patient_consent_given: boolean | null
          patient_id: string
          permission_type: string
          provider_id: string
          receiving_hospital_id: string
          request_type: string
          requesting_hospital_id: string
          status: string
          updated_at: string
          urgency_level: string
        }
        Insert: {
          audit_trail?: Json | null
          clinical_justification: string
          created_at?: string
          data_shared_at?: string | null
          expires_at?: string | null
          id?: string
          inter_hospital_approved?: boolean | null
          inter_hospital_approved_at?: string | null
          patient_consent_at?: string | null
          patient_consent_given?: boolean | null
          patient_id: string
          permission_type?: string
          provider_id: string
          receiving_hospital_id: string
          request_type?: string
          requesting_hospital_id: string
          status?: string
          updated_at?: string
          urgency_level?: string
        }
        Update: {
          audit_trail?: Json | null
          clinical_justification?: string
          created_at?: string
          data_shared_at?: string | null
          expires_at?: string | null
          id?: string
          inter_hospital_approved?: boolean | null
          inter_hospital_approved_at?: string | null
          patient_consent_at?: string | null
          patient_consent_given?: boolean | null
          patient_id?: string
          permission_type?: string
          provider_id?: string
          receiving_hospital_id?: string
          request_type?: string
          requesting_hospital_id?: string
          status?: string
          updated_at?: string
          urgency_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "cross_hospital_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_hospital_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_hospital_requests_receiving_hospital_id_fkey"
            columns: ["receiving_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospital_registry"
            referencedColumns: ["hospital_id"]
          },
          {
            foreignKeyName: "cross_hospital_requests_requesting_hospital_id_fkey"
            columns: ["requesting_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospital_registry"
            referencedColumns: ["hospital_id"]
          },
        ]
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
      enhanced_appointments: {
        Row: {
          access_expires_at: string | null
          access_granted_at: string | null
          access_request_status: string | null
          appointment_date: string
          appointment_type: string
          clinical_notes: string | null
          created_at: string | null
          id: string
          patient_id: string
          provider_id: string
          status: string | null
          updated_at: string | null
          urgency_level: string | null
        }
        Insert: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          access_request_status?: string | null
          appointment_date: string
          appointment_type: string
          clinical_notes?: string | null
          created_at?: string | null
          id?: string
          patient_id: string
          provider_id: string
          status?: string | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Update: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          access_request_status?: string | null
          appointment_date?: string
          appointment_type?: string
          clinical_notes?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string
          provider_id?: string
          status?: string | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enhanced_appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      enhanced_breach_detection: {
        Row: {
          affected_resources: string[] | null
          automated_response: Json | null
          detected_at: string
          detection_type: string
          false_positive: boolean | null
          id: string
          mitigation_status: string | null
          resolution_notes: string | null
          resolved_at: string | null
          risk_score: number | null
          severity_level: string
          threat_indicators: Json
          user_id: string | null
        }
        Insert: {
          affected_resources?: string[] | null
          automated_response?: Json | null
          detected_at?: string
          detection_type: string
          false_positive?: boolean | null
          id?: string
          mitigation_status?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          risk_score?: number | null
          severity_level: string
          threat_indicators?: Json
          user_id?: string | null
        }
        Update: {
          affected_resources?: string[] | null
          automated_response?: Json | null
          detected_at?: string
          detection_type?: string
          false_positive?: boolean | null
          id?: string
          mitigation_status?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          risk_score?: number | null
          severity_level?: string
          threat_indicators?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      enhanced_user_sessions: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_activity: string
          location_data: Json | null
          security_flags: Json | null
          session_token: string
          terminated_at: string | null
          termination_reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          location_data?: Json | null
          security_flags?: Json | null
          session_token: string
          terminated_at?: string | null
          termination_reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          location_data?: Json | null
          security_flags?: Json | null
          session_token?: string
          terminated_at?: string | null
          termination_reason?: string | null
          user_agent?: string | null
          user_id?: string
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
          metadata: Json | null
          patient_id: string | null
          provider_id: string | null
          queued_at: string | null
          record_id: string | null
          record_type: string | null
          retry_count: number | null
        }
        Insert: {
          anchor_status?: string | null
          anchored_at?: string | null
          blockchain_tx_hash?: string | null
          error_message?: string | null
          hash: string
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          provider_id?: string | null
          queued_at?: string | null
          record_id?: string | null
          record_type?: string | null
          retry_count?: number | null
        }
        Update: {
          anchor_status?: string | null
          anchored_at?: string | null
          blockchain_tx_hash?: string | null
          error_message?: string | null
          hash?: string
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          provider_id?: string | null
          queued_at?: string | null
          record_id?: string | null
          record_type?: string | null
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
      hipaa_compliance_controls: {
        Row: {
          assigned_to: string | null
          category: string
          compliance_notes: string | null
          control_id: string
          created_at: string | null
          current_evidence: string[] | null
          description: string
          evidence_required: string[] | null
          id: string
          implementation_status: string
          last_assessment_date: string | null
          next_review_date: string | null
          risk_level: string
          subcategory: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          compliance_notes?: string | null
          control_id: string
          created_at?: string | null
          current_evidence?: string[] | null
          description: string
          evidence_required?: string[] | null
          id?: string
          implementation_status?: string
          last_assessment_date?: string | null
          next_review_date?: string | null
          risk_level?: string
          subcategory?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          compliance_notes?: string | null
          control_id?: string
          created_at?: string | null
          current_evidence?: string[] | null
          description?: string
          evidence_required?: string[] | null
          id?: string
          implementation_status?: string
          last_assessment_date?: string | null
          next_review_date?: string | null
          risk_level?: string
          subcategory?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hipaa_risk_assessments: {
        Row: {
          approved_by: string | null
          assessment_date: string | null
          assessment_name: string
          assessment_type: string
          completion_date: string | null
          conducted_by: string | null
          created_at: string | null
          findings_summary: string | null
          id: string
          identified_vulnerabilities: Json | null
          mitigation_plan: Json | null
          next_assessment_date: string | null
          recommendations: string[] | null
          risk_level: string
          scope: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          assessment_date?: string | null
          assessment_name: string
          assessment_type: string
          completion_date?: string | null
          conducted_by?: string | null
          created_at?: string | null
          findings_summary?: string | null
          id?: string
          identified_vulnerabilities?: Json | null
          mitigation_plan?: Json | null
          next_assessment_date?: string | null
          recommendations?: string[] | null
          risk_level: string
          scope: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          assessment_date?: string | null
          assessment_name?: string
          assessment_type?: string
          completion_date?: string | null
          conducted_by?: string | null
          created_at?: string | null
          findings_summary?: string | null
          id?: string
          identified_vulnerabilities?: Json | null
          mitigation_plan?: Json | null
          next_assessment_date?: string | null
          recommendations?: string[] | null
          risk_level?: string
          scope?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hospital_registry: {
        Row: {
          address: string | null
          api_endpoint: string | null
          certification_data: Json | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          hospital_id: string
          hospital_name: string
          id: string
          public_key: string | null
          updated_at: string
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          address?: string | null
          api_endpoint?: string | null
          certification_data?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          hospital_id: string
          hospital_name: string
          id?: string
          public_key?: string | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          address?: string | null
          api_endpoint?: string | null
          certification_data?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          hospital_id?: string
          hospital_name?: string
          id?: string
          public_key?: string | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
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
      medical_test_notifications: {
        Row: {
          acknowledged_at: string | null
          action_required: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          medical_record_id: string | null
          patient_id: string
          priority_level: string
          provider_id: string
          requires_action: boolean | null
          result_status: string
          result_summary: string | null
          test_name: string
          test_type: string
          viewed_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          action_required?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          medical_record_id?: string | null
          patient_id: string
          priority_level?: string
          provider_id: string
          requires_action?: boolean | null
          result_status?: string
          result_summary?: string | null
          test_name: string
          test_type: string
          viewed_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          action_required?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          medical_record_id?: string | null
          patient_id?: string
          priority_level?: string
          provider_id?: string
          requires_action?: boolean | null
          result_status?: string
          result_summary?: string | null
          test_name?: string
          test_type?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_test_notifications_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "clinical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_test_notifications_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_test_notifications_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          encrypted_url: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string | null
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          encrypted_url?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url?: string | null
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          encrypted_url?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string | null
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_attachments_message"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          encrypted_content: string | null
          id: string
          is_read: boolean
          iv: string | null
          message_type: string
          read_at: string | null
          sender_id: string
          sender_type: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          encrypted_content?: string | null
          id?: string
          is_read?: boolean
          iv?: string | null
          message_type?: string
          read_at?: string | null
          sender_id: string
          sender_type: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          encrypted_content?: string | null
          id?: string
          is_read?: boolean
          iv?: string | null
          message_type?: string
          read_at?: string | null
          sender_id?: string
          sender_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      minimum_necessary_controls: {
        Row: {
          allowed_fields: string[]
          business_justification: string
          created_at: string | null
          id: string
          resource_type: string
          updated_at: string | null
          user_role: string
        }
        Insert: {
          allowed_fields: string[]
          business_justification: string
          created_at?: string | null
          id?: string
          resource_type: string
          updated_at?: string | null
          user_role: string
        }
        Update: {
          allowed_fields?: string[]
          business_justification?: string
          created_at?: string | null
          id?: string
          resource_type?: string
          updated_at?: string | null
          user_role?: string
        }
        Relationships: []
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
      otp_codes: {
        Row: {
          attempts: number
          code: string
          code_type: string
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          max_attempts: number
          used_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number
          code: string
          code_type: string
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          max_attempts?: number
          used_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number
          code?: string
          code_type?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          max_attempts?: number
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      patient_consent_preferences: {
        Row: {
          appointment_types_auto_approve: string[] | null
          auto_approve_appointments: boolean | null
          created_at: string | null
          default_access_duration_hours: number | null
          emergency_auto_approve: boolean | null
          id: string
          notification_preferences: Json | null
          patient_id: string
          trusted_providers: string[] | null
          updated_at: string | null
        }
        Insert: {
          appointment_types_auto_approve?: string[] | null
          auto_approve_appointments?: boolean | null
          created_at?: string | null
          default_access_duration_hours?: number | null
          emergency_auto_approve?: boolean | null
          id?: string
          notification_preferences?: Json | null
          patient_id: string
          trusted_providers?: string[] | null
          updated_at?: string | null
        }
        Update: {
          appointment_types_auto_approve?: string[] | null
          auto_approve_appointments?: boolean | null
          created_at?: string | null
          default_access_duration_hours?: number | null
          emergency_auto_approve?: boolean | null
          id?: string
          notification_preferences?: Json | null
          patient_id?: string
          trusted_providers?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_consent_preferences_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          patient_id: string | null
          priority: string | null
          read_at: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          patient_id?: string | null
          priority?: string | null
          read_at?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          patient_id?: string | null
          priority?: string | null
          read_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_notifications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_rights_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          handled_by: string | null
          id: string
          justification: string | null
          metadata: Json | null
          patient_id: string
          request_type: string
          requested_data: string[] | null
          response_due_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          handled_by?: string | null
          id?: string
          justification?: string | null
          metadata?: Json | null
          patient_id: string
          request_type: string
          requested_data?: string[] | null
          response_due_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          handled_by?: string | null
          id?: string
          justification?: string | null
          metadata?: Json | null
          patient_id?: string
          request_type?: string
          requested_data?: string[] | null
          response_due_date?: string | null
          status?: string
          updated_at?: string | null
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
          user_id: string
        }
        Insert: {
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
          user_id: string
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
          user_id?: string
        }
        Relationships: []
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
      provider_communications: {
        Row: {
          communication_type: string
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          patient_id: string
          priority: string
          provider_id: string
          read_at: string | null
          requires_response: boolean | null
          responded_at: string | null
          response_deadline: string | null
          response_message: string | null
          subject: string
        }
        Insert: {
          communication_type: string
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          patient_id: string
          priority?: string
          provider_id: string
          read_at?: string | null
          requires_response?: boolean | null
          responded_at?: string | null
          response_deadline?: string | null
          response_message?: string | null
          subject: string
        }
        Update: {
          communication_type?: string
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          patient_id?: string
          priority?: string
          provider_id?: string
          read_at?: string | null
          requires_response?: boolean | null
          responded_at?: string | null
          response_deadline?: string | null
          response_message?: string | null
          subject?: string
        }
        Relationships: []
      }
      provider_notifications: {
        Row: {
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          notification_type: string
          priority: string
          provider_id: string
          read_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          priority?: string
          provider_id: string
          read_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          priority?: string
          provider_id?: string
          read_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_notifications_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      quantum_threat_monitor: {
        Row: {
          created_at: string
          id: string
          level: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          level: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          attempts: number | null
          created_at: string | null
          id: string
          reset_at: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          reset_at?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          reset_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      revocation_events: {
        Row: {
          anchored: boolean | null
          anchored_at: string | null
          blockchain_tx_hash: string | null
          created_at: string | null
          event_hash: string | null
          id: string
          patient_id: string
          permission_id: string
          provider_id: string
          record_id: string | null
        }
        Insert: {
          anchored?: boolean | null
          anchored_at?: string | null
          blockchain_tx_hash?: string | null
          created_at?: string | null
          event_hash?: string | null
          id?: string
          patient_id: string
          permission_id: string
          provider_id: string
          record_id?: string | null
        }
        Update: {
          anchored?: boolean | null
          anchored_at?: string | null
          blockchain_tx_hash?: string | null
          created_at?: string | null
          event_hash?: string | null
          id?: string
          patient_id?: string
          permission_id?: string
          provider_id?: string
          record_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revocation_events_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "sharing_permissions"
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
      risk_assessments: {
        Row: {
          assessment_type: string
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string
          due_date: string | null
          id: string
          impact_description: string | null
          likelihood_description: string | null
          mitigation_steps: Json | null
          resolved_at: string | null
          risk_level: string
          risk_score: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assessment_type: string
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          due_date?: string | null
          id?: string
          impact_description?: string | null
          likelihood_description?: string | null
          mitigation_steps?: Json | null
          resolved_at?: string | null
          risk_level: string
          risk_score: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assessment_type?: string
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string | null
          id?: string
          impact_description?: string | null
          likelihood_description?: string | null
          mitigation_steps?: Json | null
          resolved_at?: string | null
          risk_level?: string
          risk_score?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      secure_sessions: {
        Row: {
          created_at: string
          csrf_token: string
          device_fingerprint: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_activity: string
          security_flags: Json | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          csrf_token: string
          device_fingerprint?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          security_flags?: Json | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          csrf_token?: string
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          security_flags?: Json | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      security_configurations: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          description: string
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          resource_id: string | null
          resource_type: string | null
          severity: string
          source: string
          title: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity: string
          source: string
          title: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          source?: string
          title?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sharing_permissions: {
        Row: {
          auto_approved: boolean | null
          clinical_justification: string | null
          created_at: string | null
          decision_note: string | null
          department: string | null
          expires_at: string | null
          grantee_id: string
          hospital_id: string | null
          id: string
          last_reminder_sent: string | null
          medical_record_id: string | null
          patient_id: string | null
          permission_type: string
          reminder_count: number | null
          request_type: string | null
          responded_at: string | null
          revoked_at: string | null
          revoked_reason: string | null
          signed_consent: string | null
          status: string
          updated_at: string | null
          urgency_level: string | null
        }
        Insert: {
          auto_approved?: boolean | null
          clinical_justification?: string | null
          created_at?: string | null
          decision_note?: string | null
          department?: string | null
          expires_at?: string | null
          grantee_id: string
          hospital_id?: string | null
          id?: string
          last_reminder_sent?: string | null
          medical_record_id?: string | null
          patient_id?: string | null
          permission_type: string
          reminder_count?: number | null
          request_type?: string | null
          responded_at?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          signed_consent?: string | null
          status?: string
          updated_at?: string | null
          urgency_level?: string | null
        }
        Update: {
          auto_approved?: boolean | null
          clinical_justification?: string | null
          created_at?: string | null
          decision_note?: string | null
          department?: string | null
          expires_at?: string | null
          grantee_id?: string
          hospital_id?: string | null
          id?: string
          last_reminder_sent?: string | null
          medical_record_id?: string | null
          patient_id?: string | null
          permission_type?: string
          reminder_count?: number | null
          request_type?: string | null
          responded_at?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          signed_consent?: string | null
          status?: string
          updated_at?: string | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sharing_permissions_grantee_id_fkey"
            columns: ["grantee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      system_notifications: {
        Row: {
          action_required: boolean | null
          action_text: string | null
          action_url: string | null
          affects_all_users: boolean | null
          created_at: string | null
          dismissed_at: string | null
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          severity: string
          target_user_roles: string[] | null
          title: string
          user_id: string | null
        }
        Insert: {
          action_required?: boolean | null
          action_text?: string | null
          action_url?: string | null
          affects_all_users?: boolean | null
          created_at?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          severity?: string
          target_user_roles?: string[] | null
          title: string
          user_id?: string | null
        }
        Update: {
          action_required?: boolean | null
          action_text?: string | null
          action_url?: string | null
          affects_all_users?: boolean | null
          created_at?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          severity?: string
          target_user_roles?: string[] | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      training_completions: {
        Row: {
          certificate_id: string | null
          certificate_issued: boolean | null
          completed_at: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          module_id: string | null
          passed: boolean | null
          score: number | null
          user_id: string | null
        }
        Insert: {
          certificate_id?: string | null
          certificate_issued?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          module_id?: string | null
          passed?: boolean | null
          score?: number | null
          user_id?: string | null
        }
        Update: {
          certificate_id?: string | null
          certificate_issued?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          module_id?: string | null
          passed?: boolean | null
          score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_completions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          certification_required: boolean | null
          content: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          estimated_duration: number | null
          id: string
          module_id: string
          module_type: string
          prerequisites: string[] | null
          required_for_roles: string[] | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          certification_required?: boolean | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          module_id: string
          module_type: string
          prerequisites?: string[] | null
          required_for_roles?: string[] | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          certification_required?: boolean | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          module_id?: string
          module_type?: string
          prerequisites?: string[] | null
          required_for_roles?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
      user_behavior_analytics: {
        Row: {
          access_pattern: string | null
          action_type: string
          anomaly_score: number | null
          id: string
          ip_address: unknown | null
          is_anomalous: boolean | null
          metadata: Json | null
          resource_accessed: string | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_pattern?: string | null
          action_type: string
          anomaly_score?: number | null
          id?: string
          ip_address?: unknown | null
          is_anomalous?: boolean | null
          metadata?: Json | null
          resource_accessed?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_pattern?: string | null
          action_type?: string
          anomaly_score?: number | null
          id?: string
          ip_address?: unknown | null
          is_anomalous?: boolean | null
          metadata?: Json | null
          resource_accessed?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
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
          security_flags: Json | null
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
          security_flags?: Json | null
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
          security_flags?: Json | null
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
      workflow_automation_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          rule_name: string
          rule_type: string
          updated_at: string | null
        }
        Insert: {
          actions: Json
          conditions: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          rule_name: string
          rule_type: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          rule_name?: string
          rule_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_automation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      check_user_permission_secure: {
        Args: { required_permission: string }
        Returns: boolean
      }
      cleanup_expired_otps: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_sessions_enhanced: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      extend_session: {
        Args: { session_token_param: string }
        Returns: boolean
      }
      generate_secure_otp: {
        Args: { user_id_param: string; code_type_param?: string }
        Returns: string
      }
      get_access_logs_by_patient: {
        Args: { current_patient_id: string }
        Returns: {
          id: string
          provider_id: string
          action: string
          record_id: string
          log_timestamp: string
        }[]
      }
      get_appointment_details: {
        Args: { appointment_id_param: string }
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role_secure: {
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
      has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      log_security_event_secure: {
        Args: {
          event_type: string
          severity: string
          description: string
          metadata?: Json
        }
        Returns: undefined
      }
      log_sensitive_operation: {
        Args: {
          operation_type: string
          resource_type: string
          resource_id?: string
          additional_details?: Json
        }
        Returns: undefined
      }
      mark_messages_as_read: {
        Args: { conversation_id_param: string; user_id_param: string }
        Returns: undefined
      }
      provider_submit_record: {
        Args: {
          provider_id_param: string
          patient_id_param: string
          record_type_param: string
          encrypted_data_param: string
          iv_param: string
        }
        Returns: string
      }
      respond_to_appointment_access_request: {
        Args: {
          appointment_id_param: string
          decision_param: string
          note_param?: string
        }
        Returns: Json
      }
      revoke_sharing_permission: {
        Args: { permission_id: string }
        Returns: undefined
      }
      update_wallet_address: {
        Args: { user_id: string; wallet: string }
        Returns: undefined
      }
      verify_otp: {
        Args: {
          user_id_param: string
          code_param: string
          code_type_param?: string
        }
        Returns: boolean
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
      notification_type_enum:
        | "access_request"
        | "access_granted"
        | "access_revoked"
        | "access_expired"
        | "access_auto_approved"
        | "appointment_access_request"
        | "cross_hospital_request"
        | "cross_hospital_approved"
        | "cross_hospital_denied"
        | "medical_test_result"
        | "critical_medical_update"
        | "provider_communication"
        | "system_update"
        | "security_alert"
        | "lab_result_available"
        | "imaging_result_available"
        | "prescription_ready"
        | "appointment_reminder"
        | "medication_refill_due"
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
      notification_type_enum: [
        "access_request",
        "access_granted",
        "access_revoked",
        "access_expired",
        "access_auto_approved",
        "appointment_access_request",
        "cross_hospital_request",
        "cross_hospital_approved",
        "cross_hospital_denied",
        "medical_test_result",
        "critical_medical_update",
        "provider_communication",
        "system_update",
        "security_alert",
        "lab_result_available",
        "imaging_result_available",
        "prescription_ready",
        "appointment_reminder",
        "medication_refill_due",
      ],
      user_role: ["patient", "provider", "auditor", "admin", "compliance"],
    },
  },
} as const
