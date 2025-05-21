
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
import { useWallet } from '@/hooks/use-wallet';

const SignupForm: React.FC = () => {
  const { toast } = useToast();
  const { isLoading, handleSignup, handleWalletSignup } = useSignup();
  const { wallet, isConnecting, connectMetaMask } = useWallet();

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

  const handleWalletConnect = async () => {
    if (wallet) {
      // If already connected, continue with signup
      await handleWalletSignup(wallet.address, selectedRoles.length > 0 ? selectedRoles : ['patient']);
    } else {
      // Connect wallet first
      await connectMetaMask();
    }
  };

  // If wallet is connected after button click, trigger signup
  React.useEffect(() => {
    if (wallet && !isLoading && !isConnecting) {
      const attemptWalletSignup = async () => {
        // Use default role 'patient' if no roles selected
        await handleWalletSignup(wallet.address, selectedRoles.length > 0 ? selectedRoles : ['patient']);
      };

      // Small delay to ensure UI updates first
      const timer = setTimeout(attemptWalletSignup, 500);
      return () => clearTimeout(timer);
    }
  }, [wallet, isLoading, isConnecting]);

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
