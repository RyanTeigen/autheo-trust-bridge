
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { SOAPNoteFormValues, soapNoteFormSchema } from './soap-note/types';
import { useSOAPNoteSubmission } from './soap-note/useSOAPNoteSubmission';
import PatientInfoFields from './soap-note/PatientInfoFields';
import SOAPFields from './soap-note/SOAPFields';
import DecentralizedStorageSettings from './soap-note/DecentralizedStorageSettings';

const SOAPNoteForm = () => {
  const form = useForm<SOAPNoteFormValues>({
    resolver: zodResolver(soapNoteFormSchema),
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

  const { handleSubmit, isSubmitting, isDistributing } = useSOAPNoteSubmission();
  
  const onSubmit = async (values: SOAPNoteFormValues) => {
    const success = await handleSubmit(values);
    if (success) {
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
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PatientInfoFields form={form} />
        
        <SOAPFields form={form} />
        
        <DecentralizedStorageSettings form={form} />
        
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
