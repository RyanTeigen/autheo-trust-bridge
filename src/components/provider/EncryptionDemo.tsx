/**
 * Demo component to showcase the hybrid encryption and blockchain anchoring flow
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Link2, CheckCircle } from 'lucide-react';
import { encryptMedicalRecord, anchorRecordToBlockchain, generateRecordHash } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';

export default function EncryptionDemo() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    encrypted?: any;
    anchored?: any;
    hash?: string;
  }>({});
  const { toast } = useToast();

  const runDemo = async () => {
    setLoading(true);
    setResults({});
    
    try {
      // Mock patient data
      const mockRecord = {
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
        timestamp: new Date().toISOString(),
        provider_notes: 'Normal blood pressure reading'
      };
      
      const mockPatientId = 'demo-patient-123';
      const mockPublicKey = 'mock_kyber_public_key_demo';
      
      // Step 1: Encrypt the record
      console.log('🔐 Encrypting medical record...');
      const encrypted = await encryptMedicalRecord(
        JSON.stringify(mockRecord),
        mockPublicKey
      );
      
      setResults(prev => ({ ...prev, encrypted }));
      toast({
        title: "Encryption Complete",
        description: "Medical record encrypted with hybrid AES + Kyber",
      });
      
      // Wait a bit for UI update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Generate record hash
      console.log('🔗 Generating record hash...');
      const recordHash = await generateRecordHash(
        'demo-record-456',
        mockPatientId,
        mockRecord.type,
        mockRecord.timestamp
      );
      
      setResults(prev => ({ ...prev, hash: recordHash }));
      
      // Step 3: Anchor to blockchain (simulated)
      console.log('⛓️ Anchoring to blockchain...');
      const anchored = await anchorRecordToBlockchain(
        'demo-record-456',
        mockPatientId,
        mockRecord.type
      );
      
      setResults(prev => ({ ...prev, anchored }));
      toast({
        title: "Blockchain Anchored",
        description: "Record provenance logged to blockchain",
      });
      
    } catch (error) {
      console.error('Demo error:', error);
      toast({
        title: "Demo Error",
        description: error instanceof Error ? error.message : "Demo failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Hybrid Encryption + Blockchain Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-300 text-sm">
          This demo shows the complete flow: AES + Kyber encryption → SHA-256 hash → Blockchain anchoring
        </p>
        
        <Button 
          onClick={runDemo} 
          disabled={loading}
          className="w-full bg-autheo-primary hover:bg-autheo-primary/90"
        >
          {loading ? 'Running Demo...' : 'Run Full Encryption Demo'}
        </Button>
        
        {/* Results Display */}
        {results.encrypted && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-800">
                Encrypted
              </Badge>
            </div>
            <div className="bg-slate-700 p-3 rounded text-xs font-mono">
              <div><strong>Algorithm:</strong> Hybrid AES + Kyber</div>
              <div><strong>Payload:</strong> {results.encrypted.encryptedPayload.substring(0, 50)}...</div>
              <div><strong>Key:</strong> {results.encrypted.encryptedKey.substring(0, 50)}...</div>
            </div>
          </div>
        )}
        
        {results.hash && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <Badge variant="secondary" className="bg-blue-900/20 text-blue-400 border-blue-800">
                Hashed
              </Badge>
            </div>
            <div className="bg-slate-700 p-3 rounded text-xs font-mono">
              <div><strong>SHA-256:</strong> {results.hash}</div>
            </div>
          </div>
        )}
        
        {results.anchored && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-400" />
              <Badge variant="secondary" className="bg-purple-900/20 text-purple-400 border-purple-800">
                Anchored
              </Badge>
            </div>
            <div className="bg-slate-700 p-3 rounded text-xs font-mono">
              <div><strong>Status:</strong> {results.anchored.status}</div>
              <div><strong>Anchor ID:</strong> {results.anchored.anchor_id}</div>
              <div><strong>Timestamp:</strong> {results.anchored.anchored_at}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}