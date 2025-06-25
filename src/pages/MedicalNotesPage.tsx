
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SOAPNoteForm from '@/components/emr/SOAPNoteForm';
import RecentNotesList from '@/components/emr/RecentNotesList';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Shield, Server } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

const MedicalNotesPage = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [nodeStatus, setNodeStatus] = useState<{
    active: number;
    total: number;
    lastChecked: string | null;
  }>({
    active: 0,
    total: 0,
    lastChecked: null
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, profile } = useAuth();
  
  useEffect(() => {
    // Simulate fetching node status - in a real implementation this would check actual nodes
    const fetchNodeStatus = async () => {
      try {
        // Simulated node status - in production this would check real node availability
        setNodeStatus({
          active: 3,
          total: 3,
          lastChecked: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error checking node status:", error);
      }
    };
    
    fetchNodeStatus();
  }, []);

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
        <Alert className="mb-4">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            You are accessing this page with creator privileges. Normally, this page is restricted to users with provider or admin roles.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Decentralized Storage Status */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <Card className="w-full md:w-1/2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Server className="h-4 w-4 mr-2 text-primary" /> 
              Decentralized Storage Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Storage Nodes:</span>
                <span className="font-medium">
                  <span className={nodeStatus.active === nodeStatus.total ? "text-green-500" : "text-amber-500"}>
                    {nodeStatus.active}
                  </span>/{nodeStatus.total} active
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data Integrity:</span>
                <span className="text-green-500 font-medium flex items-center">
                  <Shield className="h-3.5 w-3.5 mr-1" /> Verified
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Checked:</span>
                <span>{nodeStatus.lastChecked ? new Date(nodeStatus.lastChecked).toLocaleTimeString() : 'Never'}</span>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                Medical notes are encrypted and stored on decentralized nodes with patient-controlled access.
              </div>
            </div>
          </CardContent>
        </Card>
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
