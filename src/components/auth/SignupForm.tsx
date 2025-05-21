
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formSchema, FormValues } from './signup/schema';
import { useSignup } from './signup/useSignup';
import RoleSelector from './signup/RoleSelector';
import SignupFormFields from './signup/SignupFormFields';

const SignupForm: React.FC = () => {
  const { toast } = useToast();
  const { isLoading, handleSignup } = useSignup();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      roles: [],
    },
    mode: "onChange", // Enable validation as the user types
  });

  const selectedRoles = form.watch('roles') || [];
  const formState = form.formState;
  const isFormValid = formState.isValid && selectedRoles.length > 0;

  const onSubmit = (values: FormValues) => {
    handleSignup(values);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SignupFormFields form={form} />
          <RoleSelector form={form} />

          <div className="pt-2">
            <Button 
              type="submit"
              className="w-full transition-all"
              disabled={isLoading || !isFormValid}
              variant="autheo"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
            
            {!isFormValid && formState.isDirty && (
              <p className="text-xs text-amber-400 mt-2 text-center">
                Please complete all required fields and select at least one role
              </p>
            )}
          </div>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-600"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-slate-800 text-slate-400">or register with</span>
        </div>
      </div>

      <Button
        variant="autheo-outline"
        className="w-full"
        type="button"
        onClick={() => toast({
          title: "Coming Soon",
          description: "Wallet registration will be available in the next update",
        })}
      >
        <Wallet className="mr-2 h-4 w-4" />
        Register with Wallet
      </Button>
    </div>
  );
};

export default SignupForm;
