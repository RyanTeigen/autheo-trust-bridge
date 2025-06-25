
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Key, RefreshCw, FileText } from 'lucide-react';

interface SharedRecordsHeaderProps {
  recordsCount: number;
  showPrivateKeyDialog: boolean;
  setShowPrivateKeyDialog: (show: boolean) => void;
  privateKey: string;
  setPrivateKey: (key: string) => void;
  onDecryptRecords: () => void;
}

const SharedRecordsHeader: React.FC<SharedRecordsHeaderProps> = ({
  recordsCount,
  showPrivateKeyDialog,
  setShowPrivateKeyDialog,
  privateKey,
  setPrivateKey,
  onDecryptRecords
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Shared Medical Records</h2>
        <p className="text-gray-600 flex items-center gap-2 mt-1">
          <Shield className="h-4 w-4" />
          Records shared with quantum-safe encryption
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Dialog open={showPrivateKeyDialog} onOpenChange={setShowPrivateKeyDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Set Private Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Private Key for Decryption</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="privateKey">ML-KEM Private Key (Base64)</Label>
                <Input
                  id="privateKey"
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter your private key..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your private key is used to decrypt records shared with you
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPrivateKeyDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={onDecryptRecords} disabled={!privateKey}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Decrypt Records
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Badge variant="secondary" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {recordsCount} Records
        </Badge>
      </div>
    </div>
  );
};

export default SharedRecordsHeader;
