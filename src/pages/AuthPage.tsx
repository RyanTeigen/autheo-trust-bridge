
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useFrontendAuth } from '@/contexts/FrontendAuthContext';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useFrontendAuth();

  // Get the page they were trying to visit from location state
  const from = location.state?.from || '/';

  // Check if user is already logged in and redirect them
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('User is already authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="animate-pulse text-slate-400">Loading authentication...</div>
      </div>
    );
  }

  // Don't render the auth form if user is already authenticated
  if (isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="animate-pulse text-slate-400">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Autheo Health</h1>
          <p className="mt-2 text-lg text-slate-400">Secure access to decentralized health records</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/60 backdrop-blur shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-center text-slate-100">Authenticate with your Digital Identity</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Connect with your decentralized ID or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-4">
                <LoginForm />
              </TabsContent>
              
              <TabsContent value="signup" className="mt-4">
                <SignupForm />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-slate-700 pt-4">
            <div className="flex justify-between w-full">
              <div className="flex items-center text-xs text-slate-400">
                <Shield className="h-3 w-3 mr-1 text-green-400" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center text-xs text-slate-400">
                <Key className="h-3 w-3 mr-1 text-blue-400" />
                <span>Zero-Knowledge Proof</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
