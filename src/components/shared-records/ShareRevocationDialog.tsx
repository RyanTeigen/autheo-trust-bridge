
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { medicalRecordsSharing } from '@/services/medical/MedicalRecordsSharing';
import { useToast } from '@/hooks/use-toast';

interface ShareRevocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareId: string;
  recipientName: string;
  onRevocationComplete: () => void;
}

const ShareRevocationDialog: React.FC<ShareRevocationDialogProps> = ({
  open,
  onOpenChange,
  shareId,
  recipientName,
  onRevocationComplete
}) => {
  const [reason, setReason] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const { toast } = useToast();

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      const result = await medicalRecordsSharing.revokeShare(shareId, reason || undefined);
      
      if (result.success) {
        toast({
          title: "Access Revoked Successfully",
          description: `${recipientName}'s access to this record has been revoked`,
        });
        
        onRevocationComplete();
        onOpenChange(false);
        setReason('');
      } else {
        throw new Error(result.error || 'Failed to revoke access');
      }
    } catch (error) {
      console.error('Failed to revoke share:', error);
      toast({
        title: "Revocation Failed",
        description: error instanceof Error ? error.message : 'Failed to revoke access',
        variant: "destructive"
      });
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Revoke Record Access
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            You are about to revoke <strong>{recipientName}</strong>'s access to this medical record. 
            This action cannot be undone, and they will no longer be able to view the record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-300">
              Reason for Revocation (Optional)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter a reason for revoking access..."
              className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
              rows={3}
            />
          </div>

          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-300 mb-1">Important:</p>
                <ul className="text-red-200 space-y-1 text-xs">
                  <li>• The recipient will lose immediate access to this record</li>
                  <li>• This action is permanent and cannot be undone</li>
                  <li>• A revocation record will be created for audit purposes</li>
                  <li>• You can share the record again later if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRevoking}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRevoke}
            disabled={isRevoking}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isRevoking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Revoking...
              </>
            ) : (
              'Revoke Access'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareRevocationDialog;
