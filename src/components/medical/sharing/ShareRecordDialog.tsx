
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DecryptedMedicalRecord } from '@/types/medical';
import { Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [shareForm, setShareForm] = useState<ShareForm>({
    granteeId: '',
    permissionType: 'read',
    expiresAt: ''
  });

  const handleShare = async () => {
    if (selectedRecordId && shareForm.granteeId) {
      await onShare(selectedRecordId, shareForm);
      setSelectedRecordId('');
      setShareForm({ granteeId: '', permissionType: 'read', expiresAt: '' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Medical Record</DialogTitle>
          <DialogDescription>
            Grant access to one of your medical records to a healthcare provider.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Record</label>
            <Select value={selectedRecordId} onValueChange={setSelectedRecordId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a record to share" />
              </SelectTrigger>
              <SelectContent>
                {records.map((record) => (
                  <SelectItem key={record.id} value={record.id}>
                    {record.data?.title || 'Untitled Record'} ({record.record_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Provider ID</label>
            <Input
              value={shareForm.granteeId}
              onChange={(e) => setShareForm(prev => ({ ...prev, granteeId: e.target.value }))}
              placeholder="Enter provider user ID"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Permission Type</label>
            <Select 
              value={shareForm.permissionType} 
              onValueChange={(value: 'read' | 'write') => setShareForm(prev => ({ ...prev, permissionType: value }))}
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
            <label className="text-sm font-medium">Expires At (Optional)</label>
            <Input
              type="datetime-local"
              value={shareForm.expiresAt}
              onChange={(e) => setShareForm(prev => ({ ...prev, expiresAt: e.target.value }))}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleShare} className="flex-1">
              Share Record
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareRecordDialog;
