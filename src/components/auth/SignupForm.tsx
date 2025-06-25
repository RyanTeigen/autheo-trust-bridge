
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
import { useFrontendAuth } from '@/contexts/FrontendAuthContext';
import { API_BASE_URL } from '@/utils/environment';

const SignupForm: React.FC = () => {
  const { toast } = useToast();
  const { login } = useFrontendAuth();
  const [isLoading, setIsLoading] = React.useState(false);
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
    mode: "onChange",
  });

  const selectedRoles = form.watch('roles') || [];
  const formState = form.formState;
  const isFormValid = formState.isValid && selectedRoles.length > 0;

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    console.log('Attempting signup with:', { email: values.email, apiUrl: `${API_BASE_URL}/auth/register` });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          username: values.email, // Using email as username
          role: selectedRoles[0], // Using the first selected role
          firstName: values.firstName,
          lastName: values.lastName,
        }),
      });

      console.log('Signup response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Signup error response:', errorText);
        
        let errorMessage = 'Registration failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Signup successful, received token');

      // 🔐 Store the private key securely (localStorage for development)
      if (data.privateKey) {
        console.log('Storing ML-KEM private key for user');
        localStorage.setItem(`mlkem_private_key_${data.user.id}`, data.privateKey);
        
        toast({
          title: "Quantum-Safe Account Created!",
          description: "Your account has been secured with post-quantum cryptography",
        });
      } else {
        toast({
          title: "Account created successfully",
          description: "Welcome to Autheo Health",
        });
      }

      // Use the login function from FrontendAuthContext to store the token
      login(data.token);

    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Please try again";
      
      if (error.message === 'Failed to fetch') {
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (error.message) {
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
              {isLoading ? "Creating Quantum-Safe Account..." : "Create Account"}
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
