
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

const MedicalNotesPage = () => {
  const [activeTab, setActiveTab] = useState('create');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, profile } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <Alert variant="warning">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            You need to be logged in to access medical notes.
            <div className="mt-3">
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                Go to Login
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Display creator access banner when the user doesn't have provider/admin role
  const hasProviderRole = profile?.roles?.includes('provider') || profile?.roles?.includes('admin');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Medical Notes</h1>
        <p className="text-muted-foreground">
          Create and manage clinical documentation for patient records
        </p>
      </div>

      {!hasProviderRole && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            You are accessing this page with creator privileges. Normally, this page is restricted to users with provider or admin roles.
          </AlertDescription>
        </Alert>
      )}

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
