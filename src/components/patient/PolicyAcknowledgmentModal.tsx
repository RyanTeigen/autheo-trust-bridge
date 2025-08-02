import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePolicyAcknowledgment } from '@/hooks/usePolicyAcknowledgment';
import { Shield, FileText, Lock, Users, Loader2 } from 'lucide-react';

export default function PolicyAcknowledgmentModal() {
  const { acknowledged, loading, acknowledgePolicy } = usePolicyAcknowledgment();
  const [acknowledging, setAcknowledging] = useState(false);

  const handleAcknowledge = async () => {
    setAcknowledging(true);
    try {
      await acknowledgePolicy();
    } finally {
      setAcknowledging(false);
    }
  };

  // Don't show modal if already acknowledged or still loading
  if (acknowledged || loading) return null;

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            HIPAA Compliance Policy Acknowledgment
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6 text-sm">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Privacy & Data Protection</h3>
                <p className="text-muted-foreground">
                  Your health information is protected under HIPAA regulations. We implement 
                  strict security measures including end-to-end encryption, quantum-resistant 
                  cryptography, and blockchain anchoring to ensure your data remains secure 
                  and private.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Encryption & Security</h3>
                <p className="text-muted-foreground">
                  All medical records are encrypted using AES-256-GCM with ML-KEM-768 
                  post-quantum cryptography. Your encryption keys are managed securely 
                  and only you have access to decrypt your data.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Data Sharing & Consent</h3>
                <p className="text-muted-foreground">
                  You maintain full control over who can access your health information. 
                  Healthcare providers must request permission before viewing your records, 
                  and you can revoke access at any time. All access is logged and auditable.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Your Rights</h3>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• Right to access and export your data</li>
                <li>• Right to control data sharing permissions</li>
                <li>• Right to request data deletion</li>
                <li>• Right to audit access logs</li>
                <li>• Right to receive breach notifications</li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground mb-4">
            By clicking "I Acknowledge", you confirm that you have read and understood 
            our HIPAA compliance policy and privacy practices.
          </p>
          <Button 
            onClick={handleAcknowledge} 
            className="w-full"
            variant="autheo"
            disabled={acknowledging}
          >
            {acknowledging ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'I Acknowledge and Agree'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}