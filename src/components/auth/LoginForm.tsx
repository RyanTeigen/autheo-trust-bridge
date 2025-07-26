
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Key } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { wallet, isConnecting, connectMetaMask } = useWallet();

  // Get the page they were trying to visit from location state
  const from = location.state?.from || '/';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: "Login successful",
          description: "Welcome back to Autheo Health",
        });
        
        // Navigate to the intended page or home
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Please check your credentials and try again";
      
      // Provide user-friendly error messages
      if (error.message.includes('Email not confirmed')) {
        errorMessage = "Please check your email and click the confirmation link before logging in.";
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message.includes('Too many requests')) {
        errorMessage = "Too many login attempts. Please wait a few minutes and try again.";
      } else if (error.message.includes('User not found')) {
        errorMessage = "No account found with this email address. Please sign up first.";
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

  const handlePasswordReset = async () => {
    const email = form.getValues('email');
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    setIsResettingPassword(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?tab=reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Password reset failed",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
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

      <div className="text-center">
        <Button 
          type="button"
          variant="link" 
          className="text-slate-400 hover:text-slate-200 text-sm"
          onClick={handlePasswordReset}
          disabled={isResettingPassword}
        >
          {isResettingPassword ? "Sending reset email..." : "Forgot your password?"}
        </Button>
      </div>

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
