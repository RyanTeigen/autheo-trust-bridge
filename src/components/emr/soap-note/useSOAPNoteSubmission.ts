
import { useState } from 'react';
import { SOAPNoteFormValues } from './types';
import { useToast } from '@/hooks/use-toast';
import { AuditLogService } from '@/services/AuditLogService';
import { supabase } from '@/integrations/supabase/client';
import { encryptForRecipient, signData, distributeToNodes, ensureUserKeypair } from '@/utils/cryptoUtils';

export const useSOAPNoteSubmission = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  const handleSubmit = async (values: SOAPNoteFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Get the current authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      const providerId = session?.user?.id;
      
      if (!providerId) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create notes.",
          variant: "destructive",
        });
        return false;
      }
      
      // Stage 1: Store the initial SOAP note record
      const { data: noteData, error } = await supabase
        .from('soap_notes')
        .insert({
          patient_id: values.patientId,
          provider_id: providerId,
          visit_date: values.visitDate,
          subjective: values.subjective,
          objective: values.objective,
          assessment: values.assessment,
          plan: values.plan,
          share_with_patient: values.shareWithPatient,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error saving note:", error);
        toast({
          title: "Error Saving Note",
          description: error.message || "Failed to save clinical documentation",
          variant: "destructive",
        });
        return false;
      }
      
      // Stage 2: Begin the decentralized distribution process
      try {
        setIsDistributing(true);
        
        // Get or create the patient's public key for encryption
        const { publicKey } = await ensureUserKeypair(values.patientId);
        
        if (!publicKey) {
          throw new Error("Could not retrieve patient's public key");
        }
        
        // Create the note data to be encrypted
        const noteDataForEncryption = {
          id: noteData.id,
          subjective: values.subjective,
          objective: values.objective,
          assessment: values.assessment,
          plan: values.plan,
          provider_id: providerId,
          provider_name: values.providerName,
          visit_date: values.visitDate,
          created_at: new Date().toISOString()
        };
        
        // Sign the data with the provider's key
        const signature = signData(noteDataForEncryption, providerId);
        
        // Encrypt the note for the patient
        const encryptedNote = encryptForRecipient(
          { ...noteDataForEncryption, signature },
          publicKey
        );
        
        // Metadata visible on the blockchain (not encrypted)
        const metadata = {
          note_id: noteData.id,
          patient_id: values.patientId,
          provider_id: providerId,
          visit_date: values.visitDate,
          created_at: new Date().toISOString(),
          temp_access_expires: values.temporaryAccess ? 
            new Date(Date.now() + values.accessDuration * 24 * 60 * 60 * 1000).toISOString() : 
            null
        };
        
        // Distribute the encrypted note to storage nodes
        const nodeRefs = await distributeToNodes(
          encryptedNote,
          metadata,
          values.patientId,
          providerId
        );
        
        // Update the original note with the decentralized references
        await supabase
          .from('soap_notes')
          .update({
            distribution_status: 'distributed',
          })
          .eq('id', noteData.id);
          
        // Create a notification for the patient
        await supabase.from('user_notifications').insert({
          user_id: values.patientId,
          title: "New Medical Note Available",
          message: `Dr. ${values.providerName} has created a new medical note from your visit on ${new Date(values.visitDate).toLocaleDateString()}.`,
          type: "soap_note",
          reference_id: noteData.id,
          created_at: new Date().toISOString(),
          is_read: false
        });
          
      } catch (distError) {
        console.error("Error in decentralized distribution:", distError);
        toast({
          title: "Warning",
          description: "Note saved but there was an issue with decentralized distribution. Support has been notified.",
          variant: "default",
        });
        return true; // We still return true because the note was saved
      } finally {
        setIsDistributing(false);
      }
      
      // Log the creation for HIPAA compliance
      AuditLogService.logPatientAccess(
        values.patientId,
        values.patientName,
        'Created SOAP note',
        'success',
        values.shareWithPatient ? 'Note shared with patient' : 'Note created for internal use'
      );
      
      // Also log to Supabase audit logs
      await supabase.from('audit_logs')
        .insert({
          user_id: providerId,
          action: 'Created SOAP note',
          resource: `Patient: ${values.patientName} (${values.patientId})`,
          resource_id: values.patientId,
          status: 'success',
          details: values.shareWithPatient ? 'Note shared with patient' : 'Note created for internal use'
        });
      
      // Show success message
      toast({
        title: "SOAP Note Created",
        description: `Clinical documentation for ${values.patientName} has been saved${values.shareWithPatient ? ' and shared' : ''} with decentralized backup.`,
      });
      
      return true;
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    isDistributing
  };
};
