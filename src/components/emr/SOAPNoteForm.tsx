
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
});

type FormValues = z.infer<typeof formSchema>;

const SOAPNoteForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      
      // Insert the SOAP note into Supabase
      const { data, error } = await supabase
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
        description: `Clinical documentation for ${values.patientName} has been saved${values.shareWithPatient ? ' and shared' : ''}.`,
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
          
          <FormField
            control={form.control}
            name="shareWithPatient"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
                    Make this clinical note visible to the patient in their portal
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save SOAP Note"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SOAPNoteForm;
