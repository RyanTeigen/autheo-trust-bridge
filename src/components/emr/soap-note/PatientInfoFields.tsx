
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { SOAPNoteFormValues } from './types';

interface PatientInfoFieldsProps {
  form: UseFormReturn<SOAPNoteFormValues>;
}

const PatientInfoFields: React.FC<PatientInfoFieldsProps> = ({ form }) => {
  return (
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
  );
};

export default PatientInfoFields;
