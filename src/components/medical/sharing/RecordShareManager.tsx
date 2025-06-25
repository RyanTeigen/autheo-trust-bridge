
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMedicalRecordsSharing } from '@/hooks/useMedicalRecordsSharing';
import { Shield, Share2, Trash2, Eye, Clock, User } from 'lucide-react';

interface RecordShareManagerProps {
  recordId?: string;
  recordTitle?: string;
}

const RecordShareManager: React.FC<RecordShareManagerProps> = ({ 
  recordId: propRecordId, 
  recordTitle: propRecordTitle 
}) => {
  const { toast } = useToast();
  const { shareRecord, getSharedWithMe, getMyShares, revokeShare, loading } = useMedicalRecordsSharing();
  
  const [recipientUserId, setRecipientUserId] = useState('');
  const [myShares, setMyShares] = useState([]);
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [activeTab, setActiveTab] = useState<'share' | 'my-shares' | 'shared-with-me'>('share');

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    const [mySharesResult, sharedWithMeResult] = await Promise.all([
      getMyShares(),
      getSharedWithMe()
    ]);

    if (mySharesResult.success) {
      setMyShares(mySharesResult.data || []);
    }

    if (sharedWithMeResult.success) {
      setSharedWithMe(sharedWithMeResult.data || []);
    }
  };

  const handleShare = async () => {
    if (!propRecordId || !recipientUserId) {
      toast({
        title: "Error",
        description: "Please provide both record ID and recipient user ID",
        variant: "destructive",
      });
      return;
    }

    const result = await shareRecord(propRecordId, recipientUserId);
    
    if (result.success) {
      setRecipientUserId('');
      fetchShares();
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    const result = await revokeShare(shareId);
    
    if (result.success) {
      fetchShares();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!propRecordId) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-autheo-primary flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quantum-Safe Record Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab('my-shares')}
                className={`justify-start ${activeTab === 'my-shares' ? 'bg-autheo-primary/20 border-autheo-primary' : ''}`}
              >
                <Share2 className="h-4 w-4 mr-2" />
                My Shares ({myShares.length})
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setActiveTab('shared-with-me')}
                className={`justify-start ${activeTab === 'shared-with-me' ? 'bg-autheo-primary/20 border-autheo-primary' : ''}`}
              >
                <Eye className="h-4 w-4 mr-2" />
                Shared with Me ({sharedWithMe.length})
              </Button>
            </div>

            {activeTab === 'my-shares' && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-slate-200">Records I've Shared</h3>
                {myShares.length === 0 ? (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      You haven't shared any records yet. Use the sharing feature in individual record views to start sharing.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {myShares.map((share: any) => (
                      <div key={share.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-200">Record ID: {share.record_id}</p>
                          <p className="text-xs text-slate-400">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Shared: {formatDate(share.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            Quantum-Safe
                          </Badge>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRevokeShare(share.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shared-with-me' && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-slate-200">Records Shared with Me</h3>
                {sharedWithMe.length === 0 ? (
                  <Alert>
                    <User className="h-4 w-4" />
                    <AlertDescription>
                      No records have been shared with you yet.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {sharedWithMe.map((share: any) => (
                      <div key={share.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-200">Record ID: {share.record_id}</p>
                          <p className="text-xs text-slate-400">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Shared: {formatDate(share.created_at)}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          Quantum-Safe
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Share Record: {propRecordTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This uses post-quantum encryption to ensure your medical records remain secure even against future quantum computers.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Label htmlFor="recipient">Recipient User ID</Label>
            <Input
              id="recipient"
              value={recipientUserId}
              onChange={(e) => setRecipientUserId(e.target.value)}
              placeholder="Enter the user ID of the person you want to share with"
              className="bg-slate-700 border-slate-600 text-slate-100"
            />
            <p className="text-xs text-slate-400">
              The recipient must have quantum-safe encryption enabled in their account.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleShare}
              disabled={loading || !recipientUserId}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {loading ? 'Sharing...' : 'Share Record'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setRecipientUserId('')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecordShareManager;
