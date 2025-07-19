import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, X, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { revokeConsent } from '@/utils/revokeConsent';
import { format } from 'date-fns';

interface ConsentRevokeCardProps {
  consent: {
    id: string;
    user_did: string;
    requester: string;
    data_types: string[];
    duration: string | null;
    timestamp: string;
    revoked: boolean;
    tx_id?: string | null;
  };
  onRevoke: () => void;
}

const ConsentRevokeCard: React.FC<ConsentRevokeCardProps> = ({ consent, onRevoke }) => {
  const [reason, setReason] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();

  const handleRevoke = async () => {
    try {
      setIsRevoking(true);
      
      const { revocationId, revocationHash } = await revokeConsent(consent.id, reason.trim() || undefined);
      
      toast({
        title: "Consent Revoked",
        description: "The consent has been successfully revoked and queued for blockchain anchoring.",
      });

      onRevoke();
      setShowConfirm(false);
      setReason('');
    } catch (error) {
      console.error('Error revoking consent:', error);
      toast({
        title: "Revocation Failed",
        description: error instanceof Error ? error.message : "Failed to revoke consent",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const getDurationDisplay = () => {
    if (!consent.duration) return 'Indefinite';
    return consent.duration;
  };

  const isExpired = () => {
    if (!consent.duration) return false;
    
    const createdDate = new Date(consent.timestamp);
    const durationMatch = consent.duration.match(/(\d+)\s*(days?|hours?|minutes?)/i);
    
    if (!durationMatch) return false;
    
    const [, number, unit] = durationMatch;
    const amount = parseInt(number);
    
    switch (unit.toLowerCase()) {
      case 'days':
      case 'day':
        createdDate.setDate(createdDate.getDate() + amount);
        break;
      case 'hours':
      case 'hour':
        createdDate.setHours(createdDate.getHours() + amount);
        break;
      case 'minutes':
      case 'minute':
        createdDate.setMinutes(createdDate.getMinutes() + amount);
        break;
    }
    
    return createdDate < new Date();
  };

  if (consent.revoked) {
    return (
      <Card className="border-red-500/20 bg-red-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <X className="h-4 w-4 text-red-400" />
            <Badge variant="destructive">Revoked</Badge>
            {consent.tx_id && (
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                Anchored
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-400">
            This consent has already been revoked and cannot be modified.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isExpired()) {
    return (
      <Card className="border-orange-500/20 bg-orange-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-400" />
            <Badge variant="secondary">Expired</Badge>
          </div>
          <p className="text-sm text-slate-400">
            This consent has expired and is no longer active.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!showConfirm) {
    return (
      <Card className="border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Active Consent Record
          </CardTitle>
          <CardDescription>
            This consent is currently active and can be revoked
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Consent ID:</span>
              <span className="ml-2 font-mono">{consent.id.slice(0, 8)}...</span>
            </div>
            <div>
              <span className="text-slate-400">Patient DID:</span>
              <span className="ml-2">{consent.user_did}</span>
            </div>
            <div>
              <span className="text-slate-400">Requester:</span>
              <span className="ml-2">{consent.requester}</span>
            </div>
            <div>
              <span className="text-slate-400">Duration:</span>
              <span className="ml-2">{getDurationDisplay()}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400">Data Types:</span>
              <span className="ml-2">{consent.data_types.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-400">Created:</span>
              <span className="ml-2">{format(new Date(consent.timestamp), 'PPp')}</span>
            </div>
            {consent.tx_id && (
              <div>
                <span className="text-slate-400">Blockchain TX:</span>
                <span className="ml-2 font-mono text-blue-400">{consent.tx_id.slice(0, 16)}...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Badge variant="default" className="bg-green-600">Active</Badge>
            {consent.tx_id && (
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                Blockchain Anchored
              </Badge>
            )}
          </div>

          <Button 
            variant="destructive" 
            onClick={() => setShowConfirm(true)}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Revoke This Consent
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-500/50 bg-red-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-red-400">
          <AlertTriangle className="h-5 w-5" />
          Confirm Consent Revocation
        </CardTitle>
        <CardDescription>
          This action cannot be undone. The revocation will be recorded on the blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <p className="text-sm text-slate-300">
            <strong>Revoking consent for:</strong> {consent.requester}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            <strong>Data types:</strong> {consent.data_types.join(', ')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="revoke-reason">Reason for Revocation (Optional)</Label>
          <Textarea
            id="revoke-reason"
            placeholder="Enter the reason for revoking this consent..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-amber-400 font-medium">Important Notice:</p>
              <ul className="text-amber-300 mt-1 space-y-1">
                <li>• This revocation will be immediately effective</li>
                <li>• The provider will lose access to your data</li>
                <li>• This action will be recorded on the blockchain</li>
                <li>• You cannot undo this revocation</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            onClick={() => setShowConfirm(false)}
            className="flex-1"
            disabled={isRevoking}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleRevoke}
            className="flex-1"
            disabled={isRevoking}
          >
            {isRevoking ? "Revoking..." : "Confirm Revocation"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsentRevokeCard;