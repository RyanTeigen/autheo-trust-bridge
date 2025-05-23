
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface AccessRequestNotificationProps {
  request: {
    id: string;
    noteId: string;
    noteDate: string;
    providerName: string;
    providerSpecialty: string;
    requestDate: string;
    expiryDate: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const AccessRequestNotification: React.FC<AccessRequestNotificationProps> = ({ 
  request, 
  onApprove, 
  onReject 
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(request.id);
      toast({
        title: "Access Approved",
        description: `${request.providerName} has been granted access to your medical note.`,
      });
    } catch (error) {
      console.error("Error approving access:", error);
      toast({
        title: "Error",
        description: "Failed to approve access request.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(request.id);
      toast({
        title: "Access Rejected",
        description: `Access request from ${request.providerName} has been rejected.`,
      });
    } catch (error) {
      console.error("Error rejecting access:", error);
      toast({
        title: "Error",
        description: "Failed to reject access request.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">Medical Note Access Request</h4>
              <p className="text-sm text-muted-foreground">
                {request.providerName} ({request.providerSpecialty}) requests access to your medical note from {new Date(request.noteDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              {request.status === 'pending' ? (
                <Badge className="bg-amber-100 text-amber-800 flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> Pending
                </Badge>
              ) : request.status === 'approved' ? (
                <Badge className="bg-green-100 text-green-800 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" /> Approved
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 flex items-center">
                  <XCircle className="h-3 w-3 mr-1" /> Rejected
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
            Temporary access expires on {new Date(request.expiryDate).toLocaleDateString()}
          </div>
          
          {request.status === 'pending' && (
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={isProcessing}
                onClick={handleReject}
              >
                Reject
              </Button>
              <Button 
                variant="default" 
                size="sm"
                disabled={isProcessing}
                onClick={handleApprove}
              >
                Approve Access
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessRequestNotification;
