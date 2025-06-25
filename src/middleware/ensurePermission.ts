
import { supabase } from "@/integrations/supabase/client";

export interface PermissionCheckResult {
  hasAccess: boolean;
  reason?: string;
}

/**
 * Check if a provider has access to a specific medical record
 */
export async function ensureProviderHasAccess(
  recordId: string, 
  providerId: string
): Promise<PermissionCheckResult> {
  try {
    // Check if there's an active sharing permission for this record and provider
    const { data: permission, error } = await supabase
      .from("sharing_permissions")
      .select("id, expires_at, permission_type")
      .eq("medical_record_id", recordId)
      .eq("grantee_id", providerId)
      .maybeSingle();

    if (error) {
      console.error('Error checking permission:', error);
      return { hasAccess: false, reason: 'Database error while checking permissions' };
    }

    // No permission found
    if (!permission) {
      return { hasAccess: false, reason: 'No sharing permission found' };
    }

    // Check if permission has expired
    if (permission.expires_at && new Date(permission.expires_at) < new Date()) {
      return { hasAccess: false, reason: 'Sharing permission has expired' };
    }

    // Permission exists and is valid
    return { hasAccess: true };
    
  } catch (error) {
    console.error('Unexpected error in permission check:', error);
    return { hasAccess: false, reason: 'Unexpected error during permission check' };
  }
}

/**
 * Check if a record has been revoked (exists in revoked_shares table)
 */
export async function checkRecordRevocation(recordId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("revoked_shares")
      .select("id")
      .eq("record_id", recordId)
      .maybeSingle();

    if (error) {
      console.error('Error checking revocation:', error);
      return false;
    }

    return !!data; // Returns true if record is revoked
  } catch (error) {
    console.error('Unexpected error checking revocation:', error);
    return false;
  }
}

/**
 * Combined check for both permission and revocation status
 */
export async function checkRecordAccess(
  recordId: string, 
  providerId: string
): Promise<PermissionCheckResult> {
  // First check if record is revoked
  const isRevoked = await checkRecordRevocation(recordId);
  if (isRevoked) {
    return { hasAccess: false, reason: 'Access to this record has been revoked by the patient' };
  }

  // Then check normal permissions
  return await ensureProviderHasAccess(recordId, providerId);
}
