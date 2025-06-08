
import { supabase } from '@/integrations/supabase/client';
import { FitnessAuditLogEntry } from './types';
import { FitnessAuditLogger } from './AuditLogger';
import { FitnessConsentManager } from './ConsentManager';
import { FitnessAccessPermissionManager } from './AccessPermissionManager';
import { 
  validateDataIntegrity, 
  fitnessDataSchema, 
  sanitizeString 
} from '@/utils/validation';
import { 
  asyncHandler, 
  handleSupabaseError, 
  ValidationError,
  AuthenticationError 
} from '@/utils/errorHandling';
import { requireAuthentication, validateRateLimit } from '@/utils/security';

export class FitnessAuditService {
  private static instance: FitnessAuditService;
  private auditLogger: FitnessAuditLogger;
  private consentManager: FitnessConsentManager;
  private accessPermissionManager: FitnessAccessPermissionManager;

  private constructor() {
    this.auditLogger = new FitnessAuditLogger();
    this.consentManager = new FitnessConsentManager();
    this.accessPermissionManager = new FitnessAccessPermissionManager();
  }

  public static getInstance(): FitnessAuditService {
    if (!FitnessAuditService.instance) {
      FitnessAuditService.instance = new FitnessAuditService();
    }
    return FitnessAuditService.instance;
  }

  // Enhanced audit logging with validation
  logFitnessDataAccess = asyncHandler(async (
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any,
    status: 'success' | 'failure' | 'warning' = 'success'
  ): Promise<void> => {
    // Validate inputs
    if (!action || typeof action !== 'string') {
      throw new ValidationError('Action is required and must be a string');
    }
    
    if (!resourceType || typeof resourceType !== 'string') {
      throw new ValidationError('Resource type is required and must be a string');
    }
    
    // Sanitize inputs
    const sanitizedAction = sanitizeString(action);
    const sanitizedResourceType = sanitizeString(resourceType);
    const sanitizedResourceId = resourceId ? sanitizeString(resourceId) : undefined;
    
    // Authenticate user
    const securityContext = await requireAuthentication();
    
    // Rate limiting
    if (!validateRateLimit(securityContext.userId, 'fitness_audit_log', 50, 60000)) {
      throw new ValidationError('Rate limit exceeded for audit logging');
    }
    
    return this.auditLogger.logFitnessDataAccess(
      sanitizedAction,
      sanitizedResourceType,
      sanitizedResourceId,
      details,
      status
    );
  });

  logDataDisclosure = asyncHandler(async (
    recipient: string,
    purpose: string,
    dataCategories: string[],
    details?: any
  ): Promise<void> => {
    // Validate inputs
    if (!recipient || typeof recipient !== 'string') {
      throw new ValidationError('Recipient is required');
    }
    
    if (!purpose || typeof purpose !== 'string') {
      throw new ValidationError('Purpose is required');
    }
    
    if (!Array.isArray(dataCategories) || dataCategories.length === 0) {
      throw new ValidationError('Data categories must be a non-empty array');
    }
    
    // Sanitize inputs
    const sanitizedRecipient = sanitizeString(recipient);
    const sanitizedPurpose = sanitizeString(purpose);
    const sanitizedCategories = dataCategories.map(cat => sanitizeString(cat));
    
    // Authenticate user
    const securityContext = await requireAuthentication();
    
    // Rate limiting
    if (!validateRateLimit(securityContext.userId, 'data_disclosure', 10, 60000)) {
      throw new ValidationError('Rate limit exceeded for data disclosure logging');
    }
    
    return this.auditLogger.logDataDisclosure(
      sanitizedRecipient,
      sanitizedPurpose,
      sanitizedCategories,
      details
    );
  });

  // Enhanced consent management with validation
  recordConsent = asyncHandler(async (
    consentType: 'data_collection' | 'data_sharing' | 'research_participation' | 'marketing' | 'third_party_access',
    consentStatus: boolean,
    consentText: string,
    consentVersion?: string
  ): Promise<void> => {
    // Validate inputs
    const validConsentTypes = ['data_collection', 'data_sharing', 'research_participation', 'marketing', 'third_party_access'];
    if (!validConsentTypes.includes(consentType)) {
      throw new ValidationError('Invalid consent type');
    }
    
    if (typeof consentStatus !== 'boolean') {
      throw new ValidationError('Consent status must be a boolean');
    }
    
    if (!consentText || typeof consentText !== 'string' || consentText.trim().length < 10) {
      throw new ValidationError('Consent text is required and must be at least 10 characters');
    }
    
    // Sanitize inputs
    const sanitizedConsentText = sanitizeString(consentText);
    const sanitizedVersion = consentVersion ? sanitizeString(consentVersion) : '1.0';
    
    // Authenticate user
    const securityContext = await requireAuthentication();
    
    // Rate limiting
    if (!validateRateLimit(securityContext.userId, 'record_consent', 20, 60000)) {
      throw new ValidationError('Rate limit exceeded for consent recording');
    }
    
    await this.consentManager.recordConsent(
      consentType,
      consentStatus,
      sanitizedConsentText,
      sanitizedVersion
    );
    
    // Also log this as an audit event with proper validation
    await this.logFitnessDataAccess(
      `Consent ${consentStatus ? 'granted' : 'withdrawn'} for ${consentType}`,
      'consent_record',
      undefined,
      { 
        consent_type: consentType, 
        consent_status: consentStatus,
        consent_version: sanitizedVersion
      }
    );
  });

  getConsentRecords = asyncHandler(async () => {
    // Authenticate user
    await requireAuthentication();
    
    return this.consentManager.getConsentRecords();
  });

  // Enhanced access permission management with validation
  grantAccessPermission = asyncHandler(async (
    grantedTo: { userId?: string; organization?: string },
    permissionType: 'read' | 'write' | 'delete' | 'share' | 'research',
    dataCategories: string[],
    purpose: string,
    expiresAt?: string,
    conditions?: any
  ): Promise<void> => {
    // Validate inputs
    if (!grantedTo || (!grantedTo.userId && !grantedTo.organization)) {
      throw new ValidationError('Must specify either userId or organization for access grant');
    }
    
    const validPermissionTypes = ['read', 'write', 'delete', 'share', 'research'];
    if (!validPermissionTypes.includes(permissionType)) {
      throw new ValidationError('Invalid permission type');
    }
    
    if (!Array.isArray(dataCategories) || dataCategories.length === 0) {
      throw new ValidationError('Data categories must be a non-empty array');
    }
    
    if (!purpose || typeof purpose !== 'string' || purpose.trim().length < 5) {
      throw new ValidationError('Purpose is required and must be at least 5 characters');
    }
    
    // Validate expiration date if provided
    if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
        throw new ValidationError('Expiration date must be a valid future date');
      }
    }
    
    // Sanitize inputs
    const sanitizedGrantedTo = {
      userId: grantedTo.userId ? sanitizeString(grantedTo.userId) : undefined,
      organization: grantedTo.organization ? sanitizeString(grantedTo.organization) : undefined
    };
    const sanitizedCategories = dataCategories.map(cat => sanitizeString(cat));
    const sanitizedPurpose = sanitizeString(purpose);
    
    // Authenticate user
    const securityContext = await requireAuthentication();
    
    // Rate limiting
    if (!validateRateLimit(securityContext.userId, 'grant_access', 5, 60000)) {
      throw new ValidationError('Rate limit exceeded for access permission grants');
    }
    
    await this.accessPermissionManager.grantAccessPermission(
      sanitizedGrantedTo,
      permissionType,
      sanitizedCategories,
      sanitizedPurpose,
      expiresAt,
      conditions
    );

    // Log this as an audit event with validation
    await this.logFitnessDataAccess(
      `Access permission granted to ${sanitizedGrantedTo.organization || 'user'}`,
      'access_permission',
      undefined,
      {
        granted_to: sanitizedGrantedTo,
        permission_type: permissionType,
        data_categories: sanitizedCategories,
        purpose: sanitizedPurpose,
        expires_at: expiresAt
      }
    );
  });

  getAccessPermissions = asyncHandler(async () => {
    // Authenticate user
    await requireAuthentication();
    
    return this.accessPermissionManager.getAccessPermissions();
  });

  getFitnessAuditLogs = asyncHandler(async (limit: number = 50): Promise<FitnessAuditLogEntry[]> => {
    // Validate limit parameter
    if (typeof limit !== 'number' || limit < 1 || limit > 1000) {
      throw new ValidationError('Limit must be a number between 1 and 1000');
    }
    
    // Authenticate user
    const securityContext = await requireAuthentication();
    
    try {
      const { data, error } = await supabase
        .from('fitness_audit_logs')
        .select('*')
        .eq('user_id', securityContext.userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw handleSupabaseError(error);
      }

      return (data || []) as FitnessAuditLogEntry[];
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new ValidationError('Failed to retrieve audit logs');
    }
  });
}

export default FitnessAuditService;
export * from './types';
