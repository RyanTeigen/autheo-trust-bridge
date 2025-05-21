
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './schema';
import { Eye, EyeOff } from 'lucide-react';

interface SignupFormFieldsProps {
  form: UseFormReturn<FormValues>;
}

const SignupFormFields: React.FC<SignupFormFieldsProps> = ({ form }) => {
  const [showPassword, setShowPassword] = useState(false);

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
                  className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100 focus:border-autheo-primary/70"
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
                  className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100 focus:border-autheo-primary/70"
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
                type="email"
                autoComplete="email"
                {...field} 
                className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100 focus:border-autheo-primary/70"
              />
            </FormControl>
            <FormDescription className="text-xs text-slate-400">
              We'll send a verification email to this address
            </FormDescription>
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
            <div className="relative">
              <FormControl>
                <Input 
                  placeholder="Create a password" 
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...field} 
                  className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100 focus:border-autheo-primary/70 pr-10"
                />
              </FormControl>
              <button
                type="button"
                className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-200"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <FormDescription className="text-xs text-slate-400">
              Password must have at least 8 characters, one uppercase letter and one number
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default SignupFormFields;
