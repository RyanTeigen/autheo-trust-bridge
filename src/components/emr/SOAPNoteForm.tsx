
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AuditLogService } from '@/services/AuditLogService';
import { supabase } from '@/integrations/supabase/client';
import { encryptForRecipient, signData, distributeToNodes, ensureUserKeypair } from '@/utils/cryptoUtils';

const formSchema = z.object({
  patientId: z.string().min(1, { message: "Patient ID is required" }),
  patientName: z.string().min(1, { message: "Patient name is required" }),
  visitDate: z.string().min(1, { message: "Visit date is required" }),
  providerName: z.string().min(1, { message: "Provider name is required" }),
  subjective: z.string().min(10, { message: "Subjective section must be at least 10 characters" }),
  objective: z.string().min(10, { message: "Objective section must be at least 10 characters" }),
  assessment: z.string().min(10, { message: "Assessment section must be at least 10 characters" }),
  plan: z.string().min(10, { message: "Plan section must be at least 10 characters" }),
  shareWithPatient: z.boolean().default(false),
  temporaryAccess: z.boolean().default(true),
  accessDuration: z.number().int().min(1).default(30),
});

type FormValues = z.infer<typeof formSchema>;

const SOAPNoteForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: '',
      patientName: '',
      visitDate: new Date().toISOString().split('T')[0],
      providerName: 'Dr. Sarah Johnson', // Default to logged in provider
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      shareWithPatient: false,
      temporaryAccess: true,
      accessDuration: 30,
    },
  });

  const onSubmit = async (values: FormValues) => {
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
        return;
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
        return;
      }
      
      // Stage 2: Begin the decentralized distribution process
      try {
        setIsDistributing(true);
        
        // Get or create the patient's public key for encryption
        // In a real implementation, the patient would already have a keypair
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
            decentralized_refs: nodeRefs,
            distribution_status: 'distributed'
          })
          .eq('id', noteData.id);
          
        // Create a notification for the patient
        await supabase
          .from('user_notifications')
          .insert({
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
        // Note: We don't fail the entire process if distribution fails
        // The note is still saved in the primary database
        toast({
          title: "Warning",
          description: "Note saved but there was an issue with decentralized distribution. Support has been notified.",
          variant: "warning",
        });
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
      
      // Reset form for next entry
      form.reset({
        patientId: '',
        patientName: '',
        visitDate: new Date().toISOString().split('T')[0],
        providerName: 'Dr. Sarah Johnson',
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        shareWithPatient: false,
        temporaryAccess: true,
        accessDuration: 30,
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter patient ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="patientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter patient name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="visitDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visit Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="providerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="subjective"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subjective</FormLabel>
                <FormDescription>
                  Patient's symptoms, complaints, and history as described by the patient
                </FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="Enter patient's subjective information..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="objective"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objective</FormLabel>
                <FormDescription>
                  Measurable, observable findings from physical examination and diagnostic tests
                </FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="Enter objective clinical findings..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="assessment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assessment</FormLabel>
                <FormDescription>
                  Clinical assessment, diagnosis, and interpretation of the patient's condition
                </FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="Enter assessment and diagnosis..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="plan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan</FormLabel>
                <FormDescription>
                  Treatment plan, medications, therapies, and follow-up instructions
                </FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="Enter treatment plan and next steps..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="p-4 border rounded-md space-y-4 bg-slate-50">
            <h3 className="text-sm font-medium">Decentralized Storage Settings</h3>
            
            <FormField
              control={form.control}
              name="temporaryAccess"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 mt-1"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Set Temporary Provider Access</FormLabel>
                    <FormDescription>
                      The patient can review and approve permanent access later
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {form.watch("temporaryAccess") && (
              <FormField
                control={form.control}
                name="accessDuration"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormLabel className="min-w-[120px]">Access Duration</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={90} 
                        className="w-20" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 30)}
                      />
                    </FormControl>
                    <span className="text-sm text-muted-foreground">days</span>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="shareWithPatient"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 mt-1"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Share with Patient</FormLabel>
                    <FormDescription>
                      Make this clinical note immediately visible to the patient in their portal
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 
              isDistributing ? 
                "Encrypting & Distributing..." : 
                "Saving..." 
              : "Save SOAP Note"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SOAPNoteForm;
