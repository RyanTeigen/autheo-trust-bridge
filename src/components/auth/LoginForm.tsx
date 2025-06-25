
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Key, AlertCircle } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFrontendAuth } from '@/contexts/FrontendAuthContext';
import { API_BASE_URL } from '@/utils/environment';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm: React.FC = () => {
  const { toast } = useToast();
  const { login } = useFrontendAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { wallet, isConnecting, connectMetaMask } = useWallet();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    console.log('Attempting login with:', { email: values.email, apiUrl: `${API_BASE_URL}/auth/login` });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login error response:', errorText);
        
        let errorMessage = 'Login failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login successful, received token');

      // Use the login function from FrontendAuthContext
      login(data.token);

      toast({
        title: "Login successful",
        description: "Welcome back to Autheo Health",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Please check your credentials and try again";
      
      if (error.message === 'Failed to fetch') {
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    if (!wallet) {
      await connectMetaMask();
      return;
    }

    setIsLoading(true);
    try {
      // For wallet login, you might have a different endpoint
      // This is a placeholder - adjust based on your backend implementation
      toast({
        title: "Wallet login",
        description: "Wallet login will be implemented based on your backend setup",
      });
    } catch (error: any) {
      console.error("Wallet login error:", error);
      toast({
        title: "Wallet login failed",
        description: error.message || "Could not authenticate with wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Using JWT-based authentication. Make sure your backend API is running at {API_BASE_URL}
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    placeholder="Enter your password" 
                    type="password" 
                    {...field} 
                    className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit"
            className="w-full"
            disabled={isLoading}
            variant="autheo"
          >
            {isLoading ? "Authenticating..." : "Login with Email"}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-600"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-slate-800 text-slate-400">or continue with</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="autheo-outline"
          className="w-full"
          type="button"
          disabled={isLoading || isConnecting}
          onClick={handleWalletLogin}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting..." : wallet ? `Connect with ${wallet.address.substring(0, 6)}...${wallet.address.substring(38)}` : "Connect MetaMask"}
        </Button>
        
        <Button
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          type="button"
          onClick={() => toast({
            title: "Coming Soon",
            description: "DID authentication will be available in the next update",
          })}
        >
          <Key className="mr-2 h-4 w-4" />
          Connect DID
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
