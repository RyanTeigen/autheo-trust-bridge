
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccessRequestAPI } from '@/hooks/useAccessRequestAPI';
import { useToast } from '@/hooks/use-toast';
import RequestAccessForm from './request/RequestAccessForm';
import EnhancedProviderWorkflow from './enhanced/EnhancedProviderWorkflow';
import { FileText, Clock, CheckCircle2, XCircle, RefreshCw, Zap } from 'lucide-react';

interface ProviderAccessRequestProps {
  isEnhanced?: boolean;
}

const ProviderAccessRequest: React.FC<ProviderAccessRequestProps> = ({ isEnhanced = false }) => {
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getMyAccessRequests } = useAccessRequestAPI();
  const { toast } = useToast();

  const fetchAccessRequests = async () => {
    try {
      setIsLoading(true);
      const result = await getMyAccessRequests();
      
      if (result.success) {
        setAccessRequests(result.data || []);
      } else {
        toast({
          title: "Failed to Load Requests",
          description: result.error || "Could not load your access requests",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching access requests:', error);
      toast({
        title: "Network Error",
        description: "Unable to load access requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessRequests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active':
        return 'default';
      case 'expired':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isEnhanced) {
    return <EnhancedProviderWorkflow />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Provider Access Requests</h2>
          <p className="text-slate-400">
            Request access to patient medical records and manage your existing requests.
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-autheo-primary text-autheo-primary hover:bg-autheo-primary hover:text-white"
        >
          <Zap className="h-4 w-4 mr-2" />
          Try Enhanced Workflow
        </Button>
      </div>

      <Alert className="border-blue-500/30 bg-blue-900/20">
        <FileText className="h-4 w-4" />
        <AlertDescription className="text-slate-200">
          <strong>Patient Privacy Notice:</strong> All access requests are subject to patient approval. 
          Patients maintain full control over their medical data and can revoke access at any time.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
          <TabsTrigger 
            value="basic" 
            className="data-[state=active]:bg-autheo-primary data-[state=active]:text-white text-slate-300"
          >
            Basic Workflow
          </TabsTrigger>
          <TabsTrigger 
            value="enhanced" 
            className="data-[state=active]:bg-autheo-primary data-[state=active]:text-white text-slate-300"
          >
            <Zap className="h-4 w-4 mr-2" />
            Enhanced Workflow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Request Form */}
            <div>
              <RequestAccessForm />
            </div>

            {/* My Access Requests */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-slate-100">My Access Requests</CardTitle>
                  <CardDescription className="text-slate-400">
                    Track the status of your patient access requests
                  </CardDescription>
                </div>
                <Button
                  onClick={fetchAccessRequests}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : accessRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No access requests yet</p>
                    <p className="text-sm">Send your first request using the form on the left</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accessRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-3 bg-slate-700 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <span className="font-medium text-slate-200">
                              {request.patientName || request.patientEmail}
                            </span>
                          </div>
                          <Badge variant={getStatusVariant(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-400 space-y-1">
                          <div>Email: {request.patientEmail}</div>
                          <div>Record Type: {request.recordType}</div>
                          <div>Requested: {new Date(request.requestedAt).toLocaleDateString()}</div>
                          {request.expiresAt && (
                            <div>Expires: {new Date(request.expiresAt).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enhanced" className="mt-6">
          <EnhancedProviderWorkflow />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderAccessRequest;
