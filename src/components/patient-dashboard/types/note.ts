
export type AccessLevel = 'full' | 'temporary' | 'revoked';

export interface NoteAccessControl {
  id: string;
  note_id: string;
  patient_id: string;
  provider_id: string;
  provider_name: string;
  access_level: AccessLevel;
  granted_at: string;
  expires_at?: string | null;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  timestamp: string;
  action: 'grant_access' | 'revoke_access' | string;
  resource: string;
  resource_id: string;
  details: string;
  status: string;
}

export interface SoapNote {
  id: string;
  visit_date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  provider_id: string;
  provider_name?: string;
  distribution_status?: string;
  decentralized_refs?: any;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}
