import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, CheckCircle, XCircle, User, FileText, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PendingRequest {
  id: string;
  grantee_id: string;
  permission_type: string;
  created_at: string;
  medical_record_id: string;
  patient_id: string;
  status: string;
  expires_at: string | null;
  urgency_level?: string;
  clinical_justification?: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  medical_records?: {
    record_type: string;
  } | null;
}

interface SimplifiedApprovalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: PendingRequest | null;
  onApprove: (request: PendingRequest, note?: string) => void;
  onDeny: (request: PendingRequest, note?: string) => void;
}

const SimplifiedApprovalModal: React.FC<SimplifiedApprovalModalProps> = ({
  isOpen,
  onOpenChange,
  request,
  onApprove,
  onDeny
}) => {
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!request) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    await onApprove(request, note);
    setIsProcessing(false);
    setNote('');
  };

  const handleDeny = async () => {
    setIsProcessing(true);
    await onDeny(request, note);
    setIsProcessing(false);
    setNote('');
  };

  const getUrgencyBadge = () => {
    if (request.urgency_level === 'urgent') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Urgent
        </Badge>
      );
    }
    if (request.urgency_level === 'high') {
      return (
        <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
          High Priority
        </Badge>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-slate-100">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-full">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl text-slate-100">
                Medical Record Access Request
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                Review the details below and make your decision
              </DialogDescription>
            </div>
            {getUrgencyBadge()}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Summary */}
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <h3 className="font-medium text-slate-200 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Healthcare Provider Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Provider:</span>
                <span className="text-slate-200 font-medium">
                  {request.profiles?.first_name} {request.profiles?.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-200">{request.profiles?.email}</span>
              </div>
            </div>
          </div>

          {/* Record Details */}
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <h3 className="font-medium text-slate-200 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Record Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Record Type:</span>
                <Badge variant="outline" className="border-slate-500">
                  {request.medical_records?.record_type || 'Medical Record'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Access Level:</span>
                <Badge variant="outline" className="border-slate-500">
                  {request.permission_type}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Requested:</span>
                <span className="text-slate-200">
                  {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </span>
              </div>
              {request.expires_at && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Expires:</span>
                  <span className="text-slate-200">
                    {new Date(request.expires_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Justification */}
          {request.clinical_justification && (
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <h3 className="font-medium text-blue-300 mb-2">Clinical Justification</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {request.clinical_justification}
              </p>
            </div>
          )}

          {/* Optional Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Add a note (optional)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any comments or conditions for your decision..."
              className="bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400"
              rows={3}
            />
          </div>

          <Separator className="bg-slate-600" />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 text-base"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <CheckCircle className="h-5 w-5 mr-2" />
              )}
              Approve Access
            </Button>
            
            <Button 
              variant="destructive"
              onClick={handleDeny}
              disabled={isProcessing}
              className="flex-1 font-medium py-3 text-base"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <XCircle className="h-5 w-5 mr-2" />
              )}
              Deny Access
            </Button>
          </div>

          <div className="text-xs text-slate-400 text-center">
            Your decision will be logged for security and compliance purposes
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimplifiedApprovalModal;