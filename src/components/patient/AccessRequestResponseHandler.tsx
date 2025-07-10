import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, FileText, User, Calendar, Shield, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface AccessRequest {
  id: string;
  medical_record_id: string;
  grantee_id: string;
  permission_type: string;
  status: string;
  created_at: string;
  medical_records: {
    id: string;
    record_type: string;
    created_at: string;
  };
  grantee: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface AccessRequestResponseHandlerProps {
  requests: AccessRequest[];
  onRequestUpdated: () => void;
}

const AccessRequestResponseHandler: React.FC<AccessRequestResponseHandlerProps> = ({ 
  requests, 
  onRequestUpdated 
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { logCustomEvent, logError } = useAuditLog();

  const handleResponse = async (requestId: string, decision: 'approved' | 'rejected', medicalRecordId: string, granteeId: string) => {
    try {
      setLoading(requestId);
      
      const note = decisionNotes[requestId]?.trim() || null;
      
      const { data, error } = await supabase.functions.invoke('respond_to_access_request', {
        body: {
          medical_record_id: medicalRecordId,
          grantee_id: granteeId,
          decision,
          note
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        // Log the decision
        await logCustomEvent(
          `ACCESS_REQUEST_${decision.toUpperCase()}`,
          'sharing_permissions',
          'success',
          requestId,
          `${decision} access request for medical record ${medicalRecordId} from user ${granteeId}`
        );

        toast({
          title: decision === 'approved' ? "Access Approved" : "Access Denied",
          description: data.message,
          variant: decision === 'approved' ? "default" : "destructive",
        });

        // Clear the note
        setDecisionNotes(prev => {
          const updated = { ...prev };
          delete updated[requestId];
          return updated;
        });

        // Refresh the requests list
        onRequestUpdated();
      } else {
        throw new Error(data.error || 'Failed to respond to access request');
      }
    } catch (err: any) {
      console.error('Error responding to access request:', err);
      
      await logError(
        `RESPOND_ACCESS_REQUEST_${decision.toUpperCase()}`,
        'sharing_permissions',
        err.message,
        requestId
      );

      toast({
        title: "Error",
        description: err.message || 'Failed to respond to access request',
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleNoteChange = (requestId: string, note: string) => {
    setDecisionNotes(prev => ({
      ...prev,
      [requestId]: note
    }));
  };

  const formatRecordType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');

  if (pendingRequests.length === 0) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          No pending access requests. Requests from healthcare providers will appear here for your approval.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">
          Pending Access Requests ({pendingRequests.length})
        </h3>
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
          Requires Action
        </Badge>
      </div>

      {pendingRequests.map((request) => (
        <Card key={request.id} className="bg-slate-900/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-autheo-primary/10 rounded-lg">
                  <User className="h-4 w-4 text-autheo-primary" />
                </div>
                <div>
                  <CardTitle className="text-slate-200 text-lg">
                    {request.grantee.first_name} {request.grantee.last_name}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {request.grantee.email}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="border-autheo-primary/30 text-autheo-primary">
                {formatRecordType(request.medical_records.record_type)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Permission: {request.permission_type}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Requested: {format(new Date(request.created_at), 'MMM dd, yyyy')}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-300 flex items-center mb-2">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Optional Note (visible to provider)
                </label>
                <Textarea
                  placeholder="Add a note about your decision (optional)..."
                  value={decisionNotes[request.id] || ''}
                  onChange={(e) => handleNoteChange(request.id, e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder-slate-500"
                  rows={2}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => handleResponse(request.id, 'approved', request.medical_record_id, request.grantee_id)}
                  disabled={loading === request.id}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  {loading === request.id ? (
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve Access
                </Button>
                
                <Button
                  onClick={() => handleResponse(request.id, 'rejected', request.medical_record_id, request.grantee_id)}
                  disabled={loading === request.id}
                  variant="destructive"
                  className="flex-1"
                >
                  {loading === request.id ? (
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Deny Access
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AccessRequestResponseHandler;