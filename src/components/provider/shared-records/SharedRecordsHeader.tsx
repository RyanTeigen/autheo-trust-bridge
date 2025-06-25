
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
        <h2 className="text-2xl font-bold text-slate-100">Shared Medical Records</h2>
        <p className="text-slate-400 flex items-center gap-2 mt-1">
          <Shield className="h-4 w-4" />
          Records shared with quantum-safe encryption
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Dialog open={showPrivateKeyDialog} onOpenChange={setShowPrivateKeyDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700">
              <Key className="h-4 w-4" />
              Set Private Key
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-100">Enter Private Key for Decryption</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="privateKey" className="text-slate-300">ML-KEM Private Key (Base64)</Label>
                <Input
                  id="privateKey"
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter your private key..."
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                />
                <p className="text-sm text-slate-400 mt-1">
                  Your private key is used to decrypt records shared with you
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPrivateKeyDialog(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={onDecryptRecords} 
                  disabled={!privateKey}
                  className="bg-autheo-primary text-slate-900 hover:bg-autheo-primary/80"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Decrypt Records
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Badge variant="secondary" className="flex items-center gap-1 bg-slate-700 text-slate-300">
          <FileText className="h-3 w-3" />
          {recordsCount} Records
        </Badge>
      </div>
    </div>
  );
};

export default SharedRecordsHeader;
