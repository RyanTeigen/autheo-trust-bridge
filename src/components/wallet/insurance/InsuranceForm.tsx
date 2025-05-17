
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InsuranceInfo } from './types';

export const formSchema = z.object({
  provider: z.string().min(2, { message: "Insurance provider is required" }),
  memberID: z.string().min(2, { message: "Member ID is required" }),
  groupNumber: z.string().optional(),
  planType: z.string().optional(),
});

export type InsuranceFormValues = z.infer<typeof formSchema>;

interface InsuranceFormProps {
  onSubmit: (values: InsuranceFormValues) => void;
  onCancel: () => void;
  initialValues?: InsuranceInfo;
}

const InsuranceForm: React.FC<InsuranceFormProps> = ({ onSubmit, onCancel, initialValues }) => {
  const form = useForm<InsuranceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ? {
      provider: initialValues.provider,
      memberID: initialValues.memberID,
      groupNumber: initialValues.groupNumber,
      planType: initialValues.planType,
    } : {
      provider: "",
      memberID: "",
      groupNumber: "",
      planType: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Insurance Provider</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Blue Cross Blue Shield" className="text-sm" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="memberID"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Member ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="ABC123456789" className="text-sm" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="groupNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Group Number (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., GRP12345" className="text-sm" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="planType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Plan Type (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., PPO, HMO" className="text-sm" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        
        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="autheo" className="flex-1 text-xs py-1 h-auto">
            Save Information
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="text-xs py-1 h-auto border-slate-200 hover:bg-slate-50" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InsuranceForm;
