
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { SOAPNoteFormValues } from './types';

interface SOAPFieldsProps {
  form: UseFormReturn<SOAPNoteFormValues>;
}

const SOAPFields: React.FC<SOAPFieldsProps> = ({ form }) => {
  return (
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
    </div>
  );
};

export default SOAPFields;
