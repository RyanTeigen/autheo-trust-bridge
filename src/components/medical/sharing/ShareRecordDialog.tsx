
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Share2, Plus } from 'lucide-react';

interface DecryptedMedicalRecord {
  id: string;
  patient_id: string;
  data: any;
  record_type: string;
  created_at: string;
  updated_at: string;
}

interface ShareForm {
  granteeId: string;
  permissionType: 'read' | 'write';
  expiresAt: string;
}

interface ShareRecordDialogProps {
  records: DecryptedMedicalRecord[];
  onShare: (recordId: string, shareForm: ShareForm) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShareRecordDialog: React.FC<ShareRecordDialogProps> = ({
  records,
  onShare,
  isOpen,
  onOpenChange
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [shareForm, setShareForm] = useState<ShareForm>({
    granteeId: '',
    permissionType: 'read',
    expiresAt: ''
  });
  const [isSharing, setIsSharing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordId || !shareForm.granteeId) return;

    setIsSharing(true);
    try {
      await onShare(selectedRecordId, shareForm);
      // Reset form
      setSelectedRecordId('');
      setShareForm({
        granteeId: '',
        permissionType: 'read',
        expiresAt: ''
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Share Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Medical Record
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="record">Select Record</Label>
            <Select value={selectedRecordId} onValueChange={setSelectedRecordId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a record to share" />
              </SelectTrigger>
              <SelectContent>
                {records.map((record) => (
                  <SelectItem key={record.id} value={record.id}>
                    {record.data.title || `${record.record_type} - ${new Date(record.created_at).toLocaleDateString()}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="granteeId">Provider/User ID</Label>
            <Input
              id="granteeId"
              value={shareForm.granteeId}
              onChange={(e) => setShareForm({ ...shareForm, granteeId: e.target.value })}
              placeholder="Enter provider or user ID"
              required
            />
          </div>

          <div>
            <Label htmlFor="permissionType">Permission Type</Label>
            <Select 
              value={shareForm.permissionType} 
              onValueChange={(value: 'read' | 'write') => 
                setShareForm({ ...shareForm, permissionType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Read Only</SelectItem>
                <SelectItem value="write">Read & Write</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={shareForm.expiresAt}
              onChange={(e) => setShareForm({ ...shareForm, expiresAt: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSharing || !selectedRecordId || !shareForm.granteeId}>
              {isSharing ? 'Sharing...' : 'Share Record'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareRecordDialog;
