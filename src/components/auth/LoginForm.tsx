
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, Key } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm: React.FC = () => {
  const { toast } = useToast();
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
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login successful",
        description: "Welcome back to Autheo Health",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
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
      // Try to find user with this wallet address
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', wallet.address)
        .limit(1);

      if (profileError) {
        throw profileError;
      }

      if (!profiles || profiles.length === 0) {
        toast({
          title: "Wallet not registered",
          description: "Please register your wallet first",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create a nonce for the wallet to sign
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const message = `Sign this message to authenticate with Autheo Health: ${nonce}`;
      
      // Ask user to sign message
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, wallet.address]
      });

      if (!signature) {
        throw new Error("Signature required for authentication");
      }

      // Generate deterministic email based on wallet address
      const walletEmail = `${wallet.address.substring(2, 10).toLowerCase()}@wallet.autheo.health`;
      
      // Use the wallet signature as a password (truncated)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: signature.substring(2, 22)
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Wallet login successful",
        description: "Welcome back to Autheo Health",
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
