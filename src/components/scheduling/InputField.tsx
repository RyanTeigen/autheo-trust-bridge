
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { AppointmentFormValues } from './schema';

interface InputFieldProps {
  form: UseFormReturn<AppointmentFormValues>;
  name: keyof AppointmentFormValues;
  label: string;
  placeholder: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ form, name, label, placeholder, required = true }) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-slate-200">
            {label}{!required && ' (Optional)'}
          </FormLabel>
          <FormControl>
            <Input 
              placeholder={placeholder} 
              {...field} 
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default InputField;
