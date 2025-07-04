import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Share2, Shield, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  full_name: string;
  email?: string;
  user_id: string;
}

interface ClinicalRecordShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  recordTitle: string;
  patient: Patient;
  onShare: (recordId: string, patientUserId: string, permissionType: 'read' | 'write', expiresAt?: string) => Promise<boolean>;
}

const ClinicalRecordShareDialog: React.FC<ClinicalRecordShareDialogProps> = ({
  isOpen,
  onClose,
  recordId,
  recordTitle,
  patient,
  onShare
}) => {
  const [permissionType, setPermissionType] = useState<'read' | 'write'>('read');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      const expirationDate = hasExpiration && expiresAt ? expiresAt : undefined;
      const success = await onShare(recordId, patient.user_id, permissionType, expirationDate);
      
      if (success) {
        onClose();
        // Reset form
        setPermissionType('read');
        setHasExpiration(false);
        setExpiresAt('');
        setShareMessage('');
      }
    } catch (error) {
      console.error('Error sharing record:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const resetForm = () => {
    setPermissionType('read');
    setHasExpiration(false);
    setExpiresAt('');
    setShareMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-autheo-primary" />
            Share Clinical Record
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Record Info */}
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-autheo-primary" />
              <span className="font-medium text-slate-200">Record Details</span>
            </div>
            <p className="text-sm text-slate-300">{recordTitle}</p>
            <p className="text-xs text-slate-400 mt-1">ID: {recordId.slice(0, 8)}...</p>
          </div>

          {/* Patient Info */}
          <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-blue-400" />
              <span className="font-medium text-slate-200">Sharing With</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">{patient.full_name}</p>
                <p className="text-xs text-slate-400">{patient.email}</p>
              </div>
              <Badge variant="outline" className="border-blue-600 text-blue-400">Patient</Badge>
            </div>
          </div>

          {/* Permission Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="permission-type" className="text-slate-200">Access Level</Label>
              <Select value={permissionType} onValueChange={(value: 'read' | 'write') => setPermissionType(value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="read">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Read Only - Patient can view record
                    </div>
                  </SelectItem>
                  <SelectItem value="write">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      Read & Comment - Patient can add comments
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiration Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="has-expiration" className="text-slate-200">Set Expiration Date</Label>
                <Switch
                  id="has-expiration"
                  checked={hasExpiration}
                  onCheckedChange={setHasExpiration}
                />
              </div>
              
              {hasExpiration && (
                <div>
                  <Label htmlFor="expires-at" className="text-slate-200 text-sm">Expires On</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <Input
                      id="expires-at"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Optional Message */}
            <div>
              <Label htmlFor="share-message" className="text-slate-200">Message to Patient (Optional)</Label>
              <Textarea
                id="share-message"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Add a note for the patient about this shared record..."
                rows={3}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-green-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-400">Secure Sharing</p>
                <p className="text-xs text-slate-300 mt-1">
                  This record will be shared using post-quantum encryption and logged for HIPAA compliance.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={isSharing || (hasExpiration && !expiresAt)}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
            >
              {isSharing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Record
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClinicalRecordShareDialog;