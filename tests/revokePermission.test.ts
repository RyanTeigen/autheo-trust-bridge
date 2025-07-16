import { createClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Create Supabase client with service role key for testing
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://ilhzzroafedbyttdfypf.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

describe('revoke_sharing_permission RPC', () => {
  let testPermissionId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test-patient@example.com',
      password: 'test-password-123',
      email_confirm: true
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }
    
    testUserId = authData.user.id;

    // Create test sharing permission
    const { data, error } = await supabase
      .from('sharing_permissions')
      .insert({
        patient_id: testUserId,
        grantee_id: 'test-provider-id',
        status: 'approved',
        permission_type: 'read',
        medical_record_id: 'test-record-id'
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create test permission: ${error?.message}`);
    }
    
    testPermissionId = data.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testPermissionId) {
      await supabase
        .from('sharing_permissions')
        .delete()
        .eq('id', testPermissionId);
    }

    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  it('should update status to revoked and create audit log', async () => {
    // Set the auth context to simulate the test user
    await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: 'test-patient@example.com'
    });

    const { error } = await supabase.rpc('revoke_sharing_permission', {
      permission_id: testPermissionId,
    });

    expect(error).toBeNull();

    // Verify status change
    const { data: updated, error: fetchError } = await supabase
      .from('sharing_permissions')
      .select('status, updated_at, responded_at')
      .eq('id', testPermissionId)
      .single();

    expect(fetchError).toBeNull();
    expect(updated?.status).toBe('revoked');
    expect(updated?.updated_at).toBeTruthy();
    expect(updated?.responded_at).toBeTruthy();

    // Verify audit log was created
    const { data: logs, error: logError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_id', testPermissionId)
      .eq('action', 'REVOKE_SHARING_PERMISSION');

    expect(logError).toBeNull();
    expect(logs).toBeTruthy();
    expect(logs!.length).toBeGreaterThan(0);
    
    const auditLog = logs![0];
    expect(auditLog.user_id).toBe(testUserId);
    expect(auditLog.resource).toBe('sharing_permissions');
    expect(auditLog.status).toBe('success');
    expect(auditLog.details).toContain('test-provider-id');
  });

  it('should fail when permission does not exist', async () => {
    const fakePermissionId = '00000000-0000-0000-0000-000000000000';
    
    const { error } = await supabase.rpc('revoke_sharing_permission', {
      permission_id: fakePermissionId,
    });

    expect(error).toBeTruthy();
    expect(error?.message).toContain('Permission not found or access denied');
  });

  it('should fail when user does not own the permission', async () => {
    // Create another test permission with a different patient_id
    const { data: unauthorizedPermission, error: createError } = await supabase
      .from('sharing_permissions')
      .insert({
        patient_id: '11111111-1111-1111-1111-111111111111', // Different user
        grantee_id: 'test-provider-id-2',
        status: 'approved',
        permission_type: 'read',
        medical_record_id: 'test-record-id-2'
      })
      .select()
      .single();

    expect(createError).toBeNull();
    expect(unauthorizedPermission).toBeTruthy();

    const { error } = await supabase.rpc('revoke_sharing_permission', {
      permission_id: unauthorizedPermission!.id,
    });

    expect(error).toBeTruthy();
    expect(error?.message).toContain('Permission not found or access denied');

    // Clean up
    await supabase
      .from('sharing_permissions')
      .delete()
      .eq('id', unauthorizedPermission!.id);
  });
});

// Integration test for the PatientSharingManager component logic
describe('PatientSharingManager Integration', () => {
  let testUserId: string;
  let testPermissions: string[] = [];

  beforeAll(async () => {
    // Create test user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test-integration@example.com',
      password: 'test-password-123',
      email_confirm: true
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }
    
    testUserId = authData.user.id;

    // Create multiple test permissions with different statuses
    const permissionsToCreate = [
      { status: 'approved', grantee_id: 'provider-1' },
      { status: 'revoked', grantee_id: 'provider-2' },
      { status: 'pending', grantee_id: 'provider-3' }
    ];

    for (const permData of permissionsToCreate) {
      const { data, error } = await supabase
        .from('sharing_permissions')
        .insert({
          patient_id: testUserId,
          grantee_id: permData.grantee_id,
          status: permData.status,
          permission_type: 'read',
          medical_record_id: `test-record-${permData.grantee_id}`
        })
        .select()
        .single();

      if (!error && data) {
        testPermissions.push(data.id);
      }
    }
  });

  afterAll(async () => {
    // Clean up
    for (const permId of testPermissions) {
      await supabase
        .from('sharing_permissions')
        .delete()
        .eq('id', permId);
    }

    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  it('should fetch permissions for a patient', async () => {
    const { data, error } = await supabase
      .from('sharing_permissions')
      .select(`
        id,
        grantee_id,
        status,
        permission_type,
        created_at,
        medical_record_id,
        expires_at
      `)
      .eq('patient_id', testUserId)
      .order('created_at', { ascending: false });

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data!.length).toBe(3);
    
    // Verify different statuses are present
    const statuses = data!.map(p => p.status);
    expect(statuses).toContain('approved');
    expect(statuses).toContain('revoked');
    expect(statuses).toContain('pending');
  });
});