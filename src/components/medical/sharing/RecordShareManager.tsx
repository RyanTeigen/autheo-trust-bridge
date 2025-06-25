
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Shield, Trash2, Users } from 'lucide-react';
import { useMedicalRecordsSharing } from '@/hooks/useMedicalRecordsSharing';
import { useToast } from '@/hooks/use-toast';

interface RecordShareManagerProps {
  recordId?: string;
  recordTitle?: string;
}

const RecordShareManager: React.FC<RecordShareManagerProps> = ({ 
  recordId, 
  recordTitle 
}) => {
  const [recipientUserId, setRecipientUserId] = useState('');
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [myShares, setMyShares] = useState([]);
  const { toast } = useToast();
  
  const {
    loading,
    shareRecord,
    getSharedWithMe,
    getMyShares,
    revokeShare
  } = useMedicalRecordsSharing();

  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    try {
      const [sharedResult, mySharesResult] = await Promise.all([
        getSharedWithMe(),
        getMyShares()
      ]);

      if (sharedResult.success) {
        setSharedWithMe(sharedResult.data || []);
      }

      if (mySharesResult.success) {
        setMyShares(mySharesResult.data || []);
      }
    } catch (error) {
      console.error('Error loading shares:', error);
    }
  };

  const handleShareRecord = async () => {
    if (!recordId || !recipientUserId.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please provide a valid recipient user ID",
        variant: "destructive",
      });
      return;
    }

    const result = await shareRecord(recordId, recipientUserId.trim());
    
    if (result.success) {
      setRecipientUserId('');
      loadShares();
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    const result = await revokeShare(shareId);
    
    if (result.success) {
      loadShares();
    }
  };

  if (recordId) {
    // Single record sharing mode
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Record: {recordTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient User ID</Label>
            <Input
              id="recipient"
              value={recipientUserId}
              onChange={(e) => setRecipientUserId(e.target.value)}
              placeholder="Enter user ID to share with"
            />
          </div>
          
          <Button 
            onClick={handleShareRecord}
            disabled={loading || !recipientUserId.trim()}
            className="w-full"
          >
            <Shield className="h-4 w-4 mr-2" />
            Share with Quantum-Safe Encryption
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Full sharing management mode
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Record Sharing</h2>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Quantum-Safe
        </Badge>
      </div>

      <Tabs defaultValue="shared-with-me" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shared-with-me">
            <Users className="h-4 w-4 mr-2" />
            Shared With Me
          </TabsTrigger>
          <TabsTrigger value="my-shares">
            <Share2 className="h-4 w-4 mr-2" />
            My Shares
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shared-with-me" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Records Shared With Me</CardTitle>
            </CardHeader>
            <CardContent>
              {sharedWithMe.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No records have been shared with you yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {sharedWithMe.map((share: any) => (
                    <div key={share.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Record ID: {share.record_id}</p>
                        <p className="text-sm text-muted-foreground">
                          Shared on: {new Date(share.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        Encrypted
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-shares" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Records I've Shared</CardTitle>
            </CardHeader>
            <CardContent>
              {myShares.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  You haven't shared any records yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {myShares.map((share: any) => (
                    <div key={share.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Record ID: {share.record_id}</p>
                        <p className="text-sm text-muted-foreground">
                          Shared with: {share.shared_with_user_id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Shared on: {new Date(share.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          Quantum-Safe
                        </Badge>
                        <Button
                          variant="destructive"
                          size="sm"
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecordShareManager;
