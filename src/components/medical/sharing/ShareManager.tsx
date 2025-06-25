
import React, { useState } from 'react';
import { useRecordSharing } from '@/hooks/useRecordSharing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Share2, X, Shield, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ShareManager() {
  const {
    shares,
    providers,
    records,
    loading,
    error,
    shareRecord,
    revokeShare,
  } = useRecordSharing();

  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  async function handleShare() {
    if (!selectedProvider || selectedRecords.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a provider and at least one record.",
        variant: "destructive"
      });
      return;
    }
    
    await shareRecord(selectedProvider, selectedRecords);
    
    if (!error) {
      toast({
        title: "Records Shared Successfully",
        description: `${selectedRecords.length} record(s) have been shared with the selected provider.`,
      });
      setSelectedProvider('');
      setSelectedRecords([]);
    }
  }

  function handleRecordSelection(recordId: string, checked: boolean) {
    if (checked) {
      setSelectedRecords(prev => [...prev, recordId]);
    } else {
      setSelectedRecords(prev => prev.filter(id => id !== recordId));
    }
  }

  async function handleRevokeShare(shareId: string) {
    await revokeShare(shareId);
    if (!error) {
      toast({
        title: "Access Revoked",
        description: "The provider's access to the record has been revoked.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Share2 className="h-6 w-6 text-autheo-primary" />
        <div>
          <h2 className="text-2xl font-bold text-autheo-primary">Record Sharing</h2>
          <p className="text-slate-400">Manage access to your medical records</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Currently Shared Records */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Currently Shared Records
          </CardTitle>
          <CardDescription>
            Records that are currently shared with healthcare providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-400">Loading shared records...</p>
          ) : shares.length === 0 ? (
            <p className="text-slate-400">No records currently shared.</p>
          ) : (
            <div className="space-y-3">
              {shares.map(share => (
                <div key={share.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{share.record_title}</Badge>
                      <span className="text-slate-400">shared with</span>
                      <Badge variant="outline">{share.provider_name}</Badge>
                    </div>
                    <p className="text-sm text-slate-400">
                      Granted on {new Date(share.granted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevokeShare(share.id)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share New Records */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Share New Records
          </CardTitle>
          <CardDescription>
            Grant access to your medical records to healthcare providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Select Provider
            </label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue placeholder="-- Select Provider --" />
              </SelectTrigger>
              <SelectContent>
                {providers.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Select Records to Share
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-700 rounded-lg p-3">
              {records.length === 0 ? (
                <p className="text-slate-400 text-sm">No medical records available</p>
              ) : (
                records.map(record => (
                  <div key={record.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={record.id}
                      checked={selectedRecords.includes(record.id)}
                      onCheckedChange={(checked) => 
                        handleRecordSelection(record.id, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={record.id} 
                      className="text-sm text-slate-300 cursor-pointer"
                    >
                      {record.record_type}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button 
            onClick={handleShare} 
            disabled={loading || !selectedProvider || selectedRecords.length === 0}
            className="w-full"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Selected Records
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
