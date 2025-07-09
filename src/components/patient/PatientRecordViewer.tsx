import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, Shield, Clock, ExternalLink, Anchor } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MedicalRecordsEncryption } from '@/services/encryption/MedicalRecordsEncryption';

interface AnchorData {
  anchor_status: string;
  blockchain_tx_hash?: string;
  anchored_at?: string;
  queued_at?: string;
}

interface SharedMedicalRecord {
  id: string;
  patient_id: string;
  record_type: string;
  encrypted_data: string;
  iv: string;
  created_at: string;
  record_hash: string;
  anchored_at?: string;
  hash_anchor_queue?: AnchorData[];
}

interface DecryptedRecord extends Omit<SharedMedicalRecord, 'encrypted_data'> {
  decrypted_value: any;
  provider_name?: string;
  unit?: string;
}

const PatientRecordViewer: React.FC = () => {
  const [records, setRecords] = useState<DecryptedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchSharedRecords();
    }
  }, [user?.id]);

  const fetchSharedRecords = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch patient records with anchoring status
      const { data: sharedRecords, error: fetchError } = await supabase.rpc('get_patient_records', {
        current_user_id: user.id
      });

      if (fetchError) {
        throw fetchError;
      }

      if (!sharedRecords || sharedRecords.length === 0) {
        setRecords([]);
        return;
      }

      // Fetch anchoring data for these records
      const recordIds = sharedRecords.map(r => r.id);
      const { data: anchorData } = await supabase
        .from('hash_anchor_queue')
        .select('record_id, anchor_status, blockchain_tx_hash, anchored_at, queued_at')
        .in('record_id', recordIds);

      // Combine records with their anchoring data
      const recordsWithAnchoring = sharedRecords.map(record => ({
        ...record,
        hash_anchor_queue: anchorData?.filter(anchor => anchor.record_id === record.id) || []
      }));

      // Decrypt each record
      const decryptedRecords: DecryptedRecord[] = [];
      
      for (const record of recordsWithAnchoring) {
        try {
          let decryptedValue;
          
          // Try to decrypt the data using the correct encryption service
          try {
            decryptedValue = await MedicalRecordsEncryption.decryptMedicalRecord(
              record.encrypted_data,
              record.iv,
              user.id
            );
          } catch (decryptError) {
            console.error('Decryption failed:', decryptError);
            // If decryption fails, show the raw encrypted data with a note
            decryptedValue = {
              error: 'Unable to decrypt record - may require different decryption keys',
              raw_data_preview: record.encrypted_data.substring(0, 50) + '...'
            };
          }

          const decryptedRecord: DecryptedRecord = {
            ...record,
            decrypted_value: decryptedValue,
            provider_name: 'Healthcare Provider', // Could be fetched from providers table
            unit: extractUnit(decryptedValue)
          };

          decryptedRecords.push(decryptedRecord);
        } catch (recordError) {
          console.error(`Error processing record ${record.id}:`, recordError);
        }
      }

      setRecords(decryptedRecords);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch shared records';
      setError(errorMessage);
      console.error('Error fetching shared records:', err);
      
      toast({
        title: "Error Loading Records",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract unit from decrypted value
  const extractUnit = (value: any): string | undefined => {
    if (typeof value === 'object' && value !== null) {
      return value.unit || value.units;
    }
    return undefined;
  };

  // Helper function to format the decrypted value for display
  const formatValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      if (value.error) {
        return `⚠️ ${value.error}`;
      }
      if (value.value !== undefined) {
        return String(value.value);
      }
      if (value.description) {
        return value.description;
      }
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">Error Loading Records</h3>
            <p className="text-slate-400">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400 opacity-50" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Shared Records</h3>
            <p className="text-slate-400">
              You don't have any shared medical records yet. Healthcare providers can share records with you for viewing.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-200">Shared Medical Records</h3>
          <p className="text-slate-400">Records shared with you by healthcare providers</p>
        </div>
        <Badge variant="secondary" className="bg-blue-900/20 text-blue-400 border-blue-800">
          {records.length} Record{records.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {records.map((record) => (
          <Card key={record.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-200 text-lg">{record.record_type}</CardTitle>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-400">
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {record.provider_name && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-400">{record.provider_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-800">
                    Shared
                  </Badge>
                  {record.record_hash && (
                    <Badge variant="secondary" className="bg-purple-900/20 text-purple-400 border-purple-800">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-4">
              {/* Decrypted Value Display */}
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-autheo-primary" />
                  <span className="text-sm font-medium text-slate-200">Decrypted Content</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-mono text-sm">
                      {formatValue(record.decrypted_value)}
                    </span>
                    {record.unit && (
                      <Badge variant="outline" className="text-xs">
                        {record.unit}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Blockchain Anchoring Status */}
              {record.hash_anchor_queue && record.hash_anchor_queue.length > 0 && (
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Anchor className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-medium text-slate-200">Blockchain Anchoring</span>
                  </div>
                  <div className="space-y-2">
                    {record.hash_anchor_queue.map((anchor, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              anchor.anchor_status === 'anchored' 
                                ? 'bg-green-900/20 text-green-400 border-green-800' 
                                : anchor.anchor_status === 'pending'
                                ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800'
                                : 'bg-red-900/20 text-red-400 border-red-800'
                            }`}
                          >
                            {anchor.anchor_status.charAt(0).toUpperCase() + anchor.anchor_status.slice(1)}
                          </Badge>
                          {anchor.queued_at && (
                            <span className="text-xs text-slate-400">
                              Queued: {new Date(anchor.queued_at).toLocaleDateString()}
                            </span>
                          )}
                          {anchor.anchored_at && (
                            <span className="text-xs text-slate-400">
                              Anchored: {new Date(anchor.anchored_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {anchor.blockchain_tx_hash && (
                          <a
                            href={`https://polygonscan.com/tx/${anchor.blockchain_tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View on Blockchain
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Record Metadata */}
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center gap-4">
                  <div>Record ID: {record.id.slice(0, 8)}...</div>
                  {record.record_hash && (
                    <div>Hash: {record.record_hash.slice(0, 8)}...</div>
                  )}
                </div>
                {record.anchored_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Anchored: {new Date(record.anchored_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatientRecordViewer;