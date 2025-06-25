
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formSchema, FormValues } from './signup/schema';
import RoleSelector from './signup/RoleSelector';
import SignupFormFields from './signup/SignupFormFields';
import { useWallet } from '@/hooks/use-wallet';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

const SignupForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(false);
  const { wallet, isConnecting, connectMetaMask } = useWallet();

  // Get the page they were trying to visit from location state
  const from = location.state?.from || '/';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      roles: [],
    },
    mode: "onChange",
  });

  const selectedRoles = form.watch('roles') || [];
  const formState = form.formState;
  const isFormValid = formState.isValid && selectedRoles.length > 0;

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    console.log('Attempting signup with Supabase:', { email: values.email });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            roles: selectedRoles,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account before signing in.",
        });

        // Don't navigate immediately - wait for email verification
        // The user will be redirected after clicking the verification link
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Please try again";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    if (wallet) {
      // Handle wallet registration here - adjust based on your backend
      toast({
        title: "Wallet Registration",
        description: "Wallet registration will be implemented based on your backend setup",
      });
    } else {
      await connectMetaMask();
    }
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
        disabled={isLoading || isConnecting}
        onClick={handleWalletConnect}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? "Connecting..." : wallet ? "Register with " + wallet.address.substring(0, 6) + "..." + wallet.address.substring(38) : "Connect MetaMask"}
      </Button>
    </div>
  );
};

export default SignupForm;
