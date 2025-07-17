import { supabase } from '@/integrations/supabase/client';

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface EnhancedAccessRequestInput {
  patientEmail: string;
  requestType: 'standard' | 'emergency' | 'cross_hospital' | 'research' | 'consultation';
  urgencyLevel: 'low' | 'normal' | 'high' | 'critical';
  hospitalId?: string;
  department?: string;
  clinicalJustification: string;
  permissionType: 'read' | 'write';
  expiresAt?: string;
}

interface AccessRequestResult {
  id: string;
  patientEmail: string;
  patientName?: string;
  requestType: string;
  urgencyLevel: string;
  status: string;
  requestedAt: string;
  expiresAt?: string;
  clinicalJustification: string;
  hospitalId?: string;
  department?: string;
}

interface PatientNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  data: any;
}

class EnhancedAccessRequestService {
  private async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }
  
  async createEnhancedAccessRequest(input: EnhancedAccessRequestInput): Promise<ServiceResponse<AccessRequestResult>> {
    try {
      const providerId = await this.getCurrentUserId();
      
      if (!providerId) {
        return { success: false, error: 'Authentication required' };
      }

      // Validate input
      if (!input.patientEmail || !input.clinicalJustification) {
        return { success: false, error: 'Patient email and clinical justification are required' };
      }

      // Find patient by email
      const { data: patients, error: patientError } = await supabase
        .from('patients')
        .select('id, full_name, user_id, email')
        .eq('email', input.patientEmail.toLowerCase().trim())
        .maybeSingle();

      if (patientError) {
        console.error('Error finding patient:', patientError);
        return { success: false, error: 'Database error while finding patient' };
      }

      if (!patients) {
        return { success: false, error: 'Patient not found with this email address' };
      }

      // Check for existing pending requests
      const { data: existingRequest } = await supabase
        .from('sharing_permissions')
        .select('id, status')
        .eq('grantee_id', providerId)
        .eq('patient_id', patients.id)
        .in('status', ['pending', 'under_review', 'awaiting_patient_response'])
        .maybeSingle();

      if (existingRequest) {
        return { 
          success: false, 
          error: `You already have a ${existingRequest.status} request for this patient` 
        };
      }

      // Find patient's latest medical record
      const { data: latestRecord } = await supabase
        .from('medical_records')
        .select('id')
        .eq('patient_id', patients.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestRecord) {
        return { success: false, error: 'No medical records found for this patient' };
      }

      // Determine initial status based on request type and urgency
      let initialStatus = 'pending';
      if (input.requestType === 'emergency' && input.urgencyLevel === 'critical') {
        initialStatus = 'under_review'; // Emergency requests get expedited review
      }

      // Create sharing permission with enhanced fields
      const { data: newRequest, error: createError } = await supabase
        .from('sharing_permissions')
        .insert({
          medical_record_id: latestRecord.id,
          patient_id: patients.id,
          grantee_id: providerId,
          permission_type: input.permissionType,
          status: initialStatus,
          request_type: input.requestType,
          urgency_level: input.urgencyLevel,
          hospital_id: input.hospitalId,
          department: input.department,
          clinical_justification: input.clinicalJustification,
          expires_at: input.expiresAt,
          auto_approved: false
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating access request:', createError);
        return { success: false, error: 'Failed to create access request' };
      }

      // Create audit trail entry
      await this.createAuditEntry(newRequest.id, 'created', null, initialStatus, providerId, input.clinicalJustification);

      // Create patient notification
      await this.createPatientNotification(patients.id, {
        type: 'access_request',
        title: this.getNotificationTitle(input.requestType, input.urgencyLevel),
        message: this.getNotificationMessage(input.requestType, input.clinicalJustification, input.hospitalId),
        priority: this.mapUrgencyToPriority(input.urgencyLevel),
        data: {
          requestId: newRequest.id,
          providerId,
          requestType: input.requestType,
          urgencyLevel: input.urgencyLevel,
          department: input.department,
          hospitalId: input.hospitalId
        }
      });

      return {
        success: true,
        data: {
          id: newRequest.id,
          patientEmail: input.patientEmail,
          patientName: patients.full_name,
          requestType: input.requestType,
          urgencyLevel: input.urgencyLevel,
          status: initialStatus,
          requestedAt: newRequest.created_at,
          expiresAt: newRequest.expires_at,
          clinicalJustification: input.clinicalJustification,
          hospitalId: input.hospitalId,
          department: input.department
        }
      };

    } catch (error) {
      console.error('Error in createEnhancedAccessRequest:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred while creating the access request' 
      };
    }
  }

  async getEnhancedAccessRequests(): Promise<ServiceResponse<AccessRequestResult[]>> {
    try {
      const providerId = await this.getCurrentUserId();
      
      if (!providerId) {
        return { success: false, error: 'Authentication required' };
      }

      const { data: requests, error } = await supabase
        .from('sharing_permissions')
        .select(`
          id,
          permission_type,
          status,
          request_type,
          urgency_level,
          hospital_id,
          department,
          clinical_justification,
          created_at,
          expires_at,
          responded_at,
          decision_note,
          patients!inner(id, full_name, email),
          medical_records!inner(id, record_type)
        `)
        .eq('grantee_id', providerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching enhanced access requests:', error);
        return { success: false, error: 'Failed to fetch access requests' };
      }

      const formattedRequests: AccessRequestResult[] = requests.map((request: any) => ({
        id: request.id,
        patientEmail: request.patients.email,
        patientName: request.patients.full_name,
        requestType: request.request_type,
        urgencyLevel: request.urgency_level,
        status: this.getRequestStatus(request.expires_at, request.status),
        requestedAt: request.created_at,
        expiresAt: request.expires_at,
        clinicalJustification: request.clinical_justification,
        hospitalId: request.hospital_id,
        department: request.department
      }));

      return { success: true, data: formattedRequests };

    } catch (error) {
      console.error('Error in getEnhancedAccessRequests:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred while fetching access requests' 
      };
    }
  }

  async sendReminder(requestId: string): Promise<ServiceResponse<boolean>> {
    try {
      const providerId = await this.getCurrentUserId();
      
      if (!providerId) {
        return { success: false, error: 'Authentication required' };
      }

      // Get request details
      const { data: request, error: requestError } = await supabase
        .from('sharing_permissions')
        .select(`
          id,
          patient_id,
          reminder_count,
          last_reminder_sent,
          patients!inner(full_name, email)
        `)
        .eq('id', requestId)
        .eq('grantee_id', providerId)
        .eq('status', 'pending')
        .single();

      if (requestError || !request) {
        return { success: false, error: 'Request not found or not eligible for reminder' };
      }

      // Check if reminder cooldown period has passed (24 hours)
      const lastReminder = new Date(request.last_reminder_sent || 0);
      const now = new Date();
      const hoursSinceLastReminder = (now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60);

      if (request.reminder_count > 0 && hoursSinceLastReminder < 24) {
        return { 
          success: false, 
          error: 'Please wait 24 hours before sending another reminder' 
        };
      }

      // Update reminder count and timestamp
      const { error: updateError } = await supabase
        .from('sharing_permissions')
        .update({
          reminder_count: (request.reminder_count || 0) + 1,
          last_reminder_sent: now.toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        return { success: false, error: 'Failed to update reminder status' };
      }

      // Create reminder notification
      await this.createPatientNotification(request.patient_id, {
        type: 'reminder',
        title: 'Reminder: Pending Access Request',
        message: `This is a reminder about a pending access request to your medical records. Please review and respond when convenient.`,
        priority: 'normal',
        data: {
          requestId,
          reminderCount: (request.reminder_count || 0) + 1
        }
      });

      // Create audit entry
      await this.createAuditEntry(requestId, 'reminded', null, null, providerId, 'Reminder sent to patient');

      return { success: true, data: true };

    } catch (error) {
      console.error('Error sending reminder:', error);
      return { success: false, error: 'Failed to send reminder' };
    }
  }

  private async createAuditEntry(
    requestId: string, 
    action: string, 
    oldStatus: string | null, 
    newStatus: string | null, 
    performedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      await supabase
        .from('access_request_audit')
        .insert({
          request_id: requestId,
          action,
          old_status: oldStatus,
          new_status: newStatus,
          performed_by: performedBy,
          notes,
          metadata: {}
        });
    } catch (error) {
      console.error('Error creating audit entry:', error);
    }
  }

  private async createPatientNotification(
    patientId: string, 
    notification: Omit<PatientNotification, 'id'>
  ): Promise<void> {
    try {
      await supabase
        .from('patient_notifications')
        .insert({
          patient_id: patientId,
          notification_type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          data: notification.data
        });
    } catch (error) {
      console.error('Error creating patient notification:', error);
    }
  }

  private getNotificationTitle(requestType: string, urgencyLevel: string): string {
    const urgencyPrefix = urgencyLevel === 'critical' ? 'URGENT: ' : 
                         urgencyLevel === 'high' ? 'High Priority: ' : '';
    
    const typeMap: { [key: string]: string } = {
      'standard': 'Medical Record Access Request',
      'emergency': 'Emergency Access Request',
      'cross_hospital': 'Cross-Hospital Access Request',
      'research': 'Research Access Request',
      'consultation': 'Consultation Access Request'
    };

    return urgencyPrefix + (typeMap[requestType] || 'Access Request');
  }

  private getNotificationMessage(requestType: string, justification: string, hospitalId?: string): string {
    const hospitalText = hospitalId ? ` from ${hospitalId}` : '';
    
    return `A healthcare provider${hospitalText} has requested access to your medical records. ` +
           `Reason: ${justification}. Please review and respond to this request.`;
  }

  private mapUrgencyToPriority(urgencyLevel: string): string {
    const mapping: { [key: string]: string } = {
      'critical': 'urgent',
      'high': 'high',
      'normal': 'normal',
      'low': 'low'
    };
    return mapping[urgencyLevel] || 'normal';
  }

  private getRequestStatus(expiresAt: string | null, currentStatus: string): string {
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return 'expired';
    }
    return currentStatus;
  }
}

export const enhancedAccessRequestService = new EnhancedAccessRequestService();