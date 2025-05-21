
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './schema';

interface SignupFormFieldsProps {
  form: UseFormReturn<FormValues>;
}

const SignupFormFields: React.FC<SignupFormFieldsProps> = ({ form }) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-200">First Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter first name" 
                  {...field} 
                  className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-200">Last Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter last name" 
                  {...field} 
                  className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-slate-200">Email</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your email" 
                {...field} 
                className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-slate-200">Password</FormLabel>
            <FormControl>
              <Input 
                placeholder="Create a password" 
                type="password" 
                {...field} 
                className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default SignupFormFields;
