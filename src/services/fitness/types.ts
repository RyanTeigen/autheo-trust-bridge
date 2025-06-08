
export interface FitnessAuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  details?: any;
  status: 'success' | 'failure' | 'warning';
  compliance_category: 'access' | 'disclosure' | 'amendment' | 'breach' | 'administrative';
}

export interface FitnessConsentRecord {
  id: string;
  user_id: string;
  consent_type: 'data_collection' | 'data_sharing' | 'research_participation' | 'marketing' | 'third_party_access';
  consent_status: boolean;
  consent_date: string;
  withdrawal_date?: string;
  consent_version: string;
  consent_text: string;
  ip_address?: string;
  digital_signature?: string;
  witness_signature?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface FitnessAccessPermission {
  id: string;
  user_id: string;
  granted_to_user_id?: string;
  granted_to_organization?: string;
  permission_type: 'read' | 'write' | 'delete' | 'share' | 'research';
  data_categories: string[];
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
  granted_by: string;
  purpose: string;
  conditions?: any;
  status: 'active' | 'expired' | 'revoked' | 'suspended';
  created_at: string;
  updated_at: string;
}
