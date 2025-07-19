
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { AppointmentFormValues } from './schema';

interface SelectFieldProps {
  form: UseFormReturn<AppointmentFormValues>;
  name: "time" | "type";
  label: string;
  placeholder: string;
  options: { value: string; label: string; }[];
}

const SelectField: React.FC<SelectFieldProps> = ({ form, name, label, placeholder, options }) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-slate-200">{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                <SelectValue placeholder={placeholder}>
                  {field.value ? field.value : placeholder}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SelectField;
