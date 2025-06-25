
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Share2 } from 'lucide-react';

interface ShareFormProps {
  recordId: string;
  recordTitle: string;
  onShare: (recipientUserId: string) => Promise<void>;
  loading: boolean;
}

const ShareForm: React.FC<ShareFormProps> = ({ recordId, recordTitle, onShare, loading }) => {
  const [recipientUserId, setRecipientUserId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipientUserId.trim()) {
      await onShare(recipientUserId.trim());
      setRecipientUserId('');
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Share Record: {recordTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This uses post-quantum encryption to ensure your medical records remain secure even against future quantum computers.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="recipient">Recipient User ID</Label>
            <Input
              id="recipient"
              value={recipientUserId}
              onChange={(e) => setRecipientUserId(e.target.value)}
              placeholder="Enter the user ID of the person you want to share with"
              className="bg-slate-700 border-slate-600 text-slate-100"
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              The recipient must have quantum-safe encryption enabled in their account.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || !recipientUserId.trim()}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {loading ? 'Sharing...' : 'Share Record'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRecipientUserId('')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShareForm;
