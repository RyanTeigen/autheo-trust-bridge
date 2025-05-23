
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { SOAPNoteFormValues } from './types';

interface DecentralizedStorageSettingsProps {
  form: UseFormReturn<SOAPNoteFormValues>;
}

const DecentralizedStorageSettings: React.FC<DecentralizedStorageSettingsProps> = ({ form }) => {
  return (
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
  );
};

export default DecentralizedStorageSettings;
