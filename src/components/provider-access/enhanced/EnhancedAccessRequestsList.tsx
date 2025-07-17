import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnhancedAccessRequestAPI } from '@/hooks/useEnhancedAccessRequestAPI';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Bell,
  Eye,
  Building2,
  Shield,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AccessRequest {
  id: string;
  patientEmail: string;
  patientName?: string;
  requestType: string;
  urgencyLevel: string;
  status: string;
  requestedAt: string;
  expiresAt?: string;
  clinicalJustification: string;
  hospitalId?: string;
  department?: string;
}

interface EnhancedAccessRequestsListProps {
  refreshTrigger?: number;
}

const EnhancedAccessRequestsList: React.FC<EnhancedAccessRequestsListProps> = ({ refreshTrigger }) => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const { getEnhancedAccessRequests, sendReminder } = useEnhancedAccessRequestAPI();
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const result = await getEnhancedAccessRequests();
      
      if (result.success) {
        setRequests(result.data || []);
      } else {
        toast({
          title: "Failed to Load Requests",
          description: result.error || "Could not load your access requests",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
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
    fetchRequests();
  }, [refreshTrigger]);

  const handleSendReminder = async (requestId: string) => {
    try {
      const result = await sendReminder(requestId);
      
      if (result.success) {
        toast({
          title: "Reminder Sent",
          description: "A reminder has been sent to the patient",
        });
      } else {
        toast({
          title: "Reminder Failed",
          description: result.error || "Failed to send reminder",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Network Error",
        description: "Unable to send reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'awaiting_patient_response':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
      case 'expired':
        return 'destructive';
      case 'under_review':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'normal': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'low': return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'cross_hospital': return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'research': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'consultation': return <Shield className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const canSendReminder = (request: AccessRequest) => {
    return request.status === 'pending' || request.status === 'awaiting_patient_response';
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Loading Requests...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-slate-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-slate-100">Enhanced Access Requests</CardTitle>
          <CardDescription className="text-slate-400">
            Track your comprehensive access requests with detailed status information
          </CardDescription>
        </div>
        <Button
          onClick={fetchRequests}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No enhanced access requests yet</p>
            <p className="text-sm">Submit your first enhanced request using the form above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-slate-700 rounded-lg border border-slate-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getRequestTypeIcon(request.requestType)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-200">
                          {request.patientName || request.patientEmail}
                        </span>
                        <Badge variant={getStatusVariant(request.status)} className="text-xs">
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="capitalize">{request.requestType.replace('_', ' ')}</span>
                        <span>•</span>
                        <Badge variant="outline" className={`text-xs ${getUrgencyColor(request.urgencyLevel)}`}>
                          {request.urgencyLevel} priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {canSendReminder(request) && (
                      <Button
                        onClick={() => handleSendReminder(request.id)}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-600"
                      >
                        <Bell className="h-3 w-3 mr-1" />
                        Remind
                      </Button>
                    )}
                    <Button
                      onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:bg-slate-600"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {expandedRequest === request.id ? 'Hide' : 'Details'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-400 mb-3">
                  <div>
                    <span className="block text-xs text-slate-500">Requested</span>
                    <span>{formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}</span>
                  </div>
                  {request.department && (
                    <div>
                      <span className="block text-xs text-slate-500">Department</span>
                      <span>{request.department}</span>
                    </div>
                  )}
                  {request.hospitalId && (
                    <div>
                      <span className="block text-xs text-slate-500">Hospital ID</span>
                      <span>{request.hospitalId}</span>
                    </div>
                  )}
                  {request.expiresAt && (
                    <div>
                      <span className="block text-xs text-slate-500">Expires</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(request.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {expandedRequest === request.id && (
                  <div className="mt-4 p-3 bg-slate-600 rounded border border-slate-500">
                    <h4 className="text-slate-200 font-medium mb-2">Clinical Justification:</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {request.clinicalJustification}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedAccessRequestsList;