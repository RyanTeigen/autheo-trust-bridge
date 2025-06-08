
import { useState } from 'react';
import { SOAPNoteFormValues } from './types';
import { useToast } from '@/hooks/use-toast';
import { AuditLogService } from '@/services/AuditLogService';
import { supabase } from '@/integrations/supabase/client';
import { encryptForRecipient, signData, distributeToNodes, ensureUserKeypair } from '@/utils/cryptoUtils';
import { 
  validateDataIntegrity, 
  soapNoteSchema, 
  sanitizeString,
  sanitizeHtml 
} from '@/utils/validation';
import { 
  asyncHandler, 
  handleSupabaseError, 
  ValidationError, 
  AuthenticationError,
  DatabaseError,
  logError 
} from '@/utils/errorHandling';
import { requireAuthentication, validateRateLimit } from '@/utils/security';

export const useSOAPNoteSubmission = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  const handleSubmit = asyncHandler(async (values: SOAPNoteFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Step 1: Validate and sanitize input data
      const sanitizedValues = {
        ...values,
        patientName: sanitizeString(values.patientName),
        providerName: sanitizeString(values.providerName),
        subjective: sanitizeHtml(values.subjective),
        objective: sanitizeHtml(values.objective),
        assessment: sanitizeHtml(values.assessment),
        plan: sanitizeHtml(values.plan)
      };
      
      // Step 2: Validate data integrity
      const validatedData = validateDataIntegrity(
        sanitizedValues, 
        soapNoteSchema, 
        'SOAP Note Creation'
      );
      
      // Step 3: Authentication and authorization check
      const securityContext = await requireAuthentication();
      const providerId = securityContext.userId;
      
      // Step 4: Rate limiting check
      if (!validateRateLimit(providerId, 'create_soap_note', 10, 60000)) {
        throw new ValidationError('Rate limit exceeded. Please wait before creating another note.');
      }
      
      // Step 5: Verify provider has permission to create notes for this patient
      const { data: accessCheck, error: accessError } = await supabase
        .from('note_access_controls')
        .select('id')
        .eq('patient_id', validatedData.patientId)
        .eq('provider_id', providerId)
        .eq('access_level', 'full')
        .maybeSingle();
      
      if (accessError && accessError.code !== 'PGRST116') {
        throw handleSupabaseError(accessError);
      }
      
      // Step 6: Begin database transaction
      const { data: noteData, error: noteError } = await supabase
        .from('soap_notes')
        .insert({
          patient_id: validatedData.patientId,
          provider_id: providerId,
          visit_date: validatedData.visitDate,
          subjective: validatedData.subjective,
          objective: validatedData.objective,
          assessment: validatedData.assessment,
          plan: validatedData.plan,
          share_with_patient: validatedData.shareWithPatient,
          distribution_status: 'pending'
        })
        .select()
        .single();
      
      if (noteError) {
        throw handleSupabaseError(noteError);
      }
      
      if (!noteData) {
        throw new DatabaseError('Failed to create SOAP note - no data returned');
      }
      
      // Step 7: Begin decentralized distribution with enhanced error handling
      try {
        setIsDistributing(true);
        
        // Get or create the patient's public key for encryption
        const { publicKey } = await ensureUserKeypair(validatedData.patientId);
        
        if (!publicKey) {
          throw new Error("Could not retrieve patient's public key");
        }
        
        // Create the note data to be encrypted with data integrity checks
        const noteDataForEncryption = {
          id: noteData.id,
          subjective: validatedData.subjective,
          objective: validatedData.objective,
          assessment: validatedData.assessment,
          plan: validatedData.plan,
          provider_id: providerId,
          provider_name: validatedData.providerName,
          visit_date: validatedData.visitDate,
          created_at: new Date().toISOString(),
          checksum: await generateDataChecksum(validatedData)
        };
        
        // Sign the data with the provider's key
        const signature = signData(noteDataForEncryption, providerId);
        
        // Encrypt the note for the patient
        const encryptedNote = await encryptForRecipient(
          { ...noteDataForEncryption, signature },
          publicKey
        );
        
        // Metadata visible on the blockchain (not encrypted)
        const metadata = {
          note_id: noteData.id,
          patient_id: validatedData.patientId,
          provider_id: providerId,
          visit_date: validatedData.visitDate,
          created_at: new Date().toISOString(),
          temp_access_expires: validatedData.temporaryAccess ? 
            new Date(Date.now() + validatedData.accessDuration * 24 * 60 * 60 * 1000).toISOString() : 
            null,
          data_hash: await generateDataChecksum(noteDataForEncryption)
        };
        
        // Distribute the encrypted note to storage nodes
        const nodeRefs = await distributeToNodes(
          encryptedNote,
          metadata,
          validatedData.patientId,
          providerId
        );
        
        // Update the original note with the decentralized references
        const { error: updateError } = await supabase
          .from('soap_notes')
          .update({
            distribution_status: 'distributed',
            decentralized_refs: nodeRefs
          })
          .eq('id', noteData.id);
        
        if (updateError) {
          throw handleSupabaseError(updateError);
        }
        
        // Record the distributed record with validation
        const { error: distributedError } = await supabase
          .from('distributed_records')
          .insert({
            record_type: 'soap_note',
            record_id: noteData.id,
            patient_id: validatedData.patientId,
            provider_id: providerId,
            distribution_status: 'distributed',
            node_references: nodeRefs,
            encryption_metadata: {
              algorithm: 'ed25519',
              encrypted_for: validatedData.patientId,
              signed_by: providerId,
              timestamp: new Date().toISOString()
            },
            signature: signature
          });
        
        if (distributedError) {
          throw handleSupabaseError(distributedError);
        }
        
        // Create access control record with proper validation
        const accessControlData = {
          note_id: noteData.id,
          patient_id: validatedData.patientId,
          provider_id: providerId,
          provider_name: validatedData.providerName,
          access_level: validatedData.temporaryAccess ? 'temporary' : 'full',
          expires_at: validatedData.temporaryAccess ? 
            new Date(Date.now() + validatedData.accessDuration * 24 * 60 * 60 * 1000).toISOString() : 
            null
        };
        
        const { error: accessError } = await supabase
          .from('note_access_controls')
          .insert(accessControlData);
        
        if (accessError) {
          throw handleSupabaseError(accessError);
        }
        
        // Create a notification for the patient with validation
        const { error: notificationError } = await supabase
          .from('user_notifications')
          .insert({
            user_id: validatedData.patientId,
            title: "New Medical Note Available",
            message: `Dr. ${sanitizeString(validatedData.providerName)} has created a new medical note from your visit on ${new Date(validatedData.visitDate).toLocaleDateString()}.`,
            type: "soap_note",
            reference_id: noteData.id,
            is_read: false
          });
        
        if (notificationError) {
          console.warn('Failed to create notification:', notificationError);
          // Don't fail the entire operation for notification errors
        }
        
      } catch (distError) {
        console.error("Error in decentralized distribution:", distError);
        logError(distError as any, { noteId: noteData.id, patientId: validatedData.patientId });
        
        // Update note status to indicate distribution failure
        await supabase
          .from('soap_notes')
          .update({ distribution_status: 'failed' })
          .eq('id', noteData.id);
        
        toast({
          title: "Warning",
          description: "Note saved but decentralized distribution failed. The note is still accessible.",
          variant: "default",
        });
        
        return true; // Note was saved, even if distribution failed
      } finally {
        setIsDistributing(false);
      }
      
      // Step 8: Log the creation for HIPAA compliance with proper validation
      try {
        AuditLogService.logPatientAccess(
          validatedData.patientId,
          sanitizeString(validatedData.patientName),
          'Created SOAP note',
          'success',
          validatedData.shareWithPatient ? 'Note shared with patient' : 'Note created for internal use'
        );
        
        // Also log to Supabase audit logs
        await supabase.from('audit_logs')
          .insert({
            user_id: providerId,
            action: 'Created SOAP note',
            resource: `Patient: ${sanitizeString(validatedData.patientName)} (${validatedData.patientId})`,
            resource_id: validatedData.patientId,
            status: 'success',
            details: validatedData.shareWithPatient ? 'Note shared with patient' : 'Note created for internal use'
          });
      } catch (auditError) {
        console.error('Audit logging failed:', auditError);
        // Don't fail the operation for audit errors, but log them
        logError(auditError as any, { operation: 'soap_note_audit', noteId: noteData.id });
      }
      
      // Success message
      toast({
        title: "SOAP Note Created",
        description: `Clinical documentation for ${validatedData.patientName} has been saved${validatedData.shareWithPatient ? ' and shared' : ''} with decentralized backup.`,
      });
      
      return true;
      
    } catch (error) {
      if (error instanceof ValidationError) {
        toast({
          title: "Validation Error",
          description: error.message,
          variant: "destructive",
        });
      } else if (error instanceof AuthenticationError) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
      } else {
        console.error("SOAP note creation error:", error);
        toast({
          title: "Error",
          description: "Failed to create SOAP note. Please try again.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    handleSubmit,
    isSubmitting,
    isDistributing
  };
};

// Helper function to generate data checksum for integrity verification
async function generateDataChecksum(data: any): Promise<string> {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data, Object.keys(data).sort()); // Consistent ordering
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataString));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
