
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SOAPNoteForm from '@/components/emr/SOAPNoteForm';
import RecentNotesList from '@/components/emr/RecentNotesList';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

const MedicalNotesPage = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        // If authenticated, get user role
        if (session) {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error("Error fetching user role:", error);
          } else {
            setUserRole(data?.role);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        
        if (session) {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
              
            setUserRole(data?.role);
          } catch (error) {
            console.error("Error fetching user role:", error);
          }
        } else {
          setUserRole(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="space-y-6">
        <div className="border border-amber-200 bg-amber-50 p-4 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Authentication Required</h3>
              <p className="text-sm text-amber-700 mt-1">
                You need to be logged in as a provider to access medical notes.
              </p>
              <Button 
                variant="outline"
                className="mt-3"
                onClick={() => navigate('/auth')}
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has appropriate role
  if (userRole !== 'provider' && userRole !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="border border-red-200 bg-red-50 p-4 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Access Denied</h3>
              <p className="text-sm text-red-700 mt-1">
                You don't have permission to access this page. 
                Only providers and administrators can access medical notes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Medical Notes</h1>
        <p className="text-muted-foreground">
          Create and manage clinical documentation for patient records
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create New Note</TabsTrigger>
          <TabsTrigger value="recent">Recent Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>SOAP Note Documentation</CardTitle>
              <CardDescription>
                Create a structured clinical note following the SOAP format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SOAPNoteForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Clinical Notes</CardTitle>
              <CardDescription>
                View and manage recently created clinical documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentNotesList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalNotesPage;
