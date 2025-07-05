/**
 * Demo component for Kyber key generation and management
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Copy, Check } from 'lucide-react';
import { generateKyberKeyPair, isValidKyberPublicKey } from '@/lib/kyber-utils';
import { storePublicKey } from '@/lib/encryptMedicalRecord';
import { useToast } from '@/hooks/use-toast';

export default function KeyManagementDemo() {
  const [loading, setLoading] = useState(false);
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [copied, setCopied] = useState<'public' | 'private' | null>(null);
  const { toast } = useToast();

  const generateKeys = async () => {
    setLoading(true);
    try {
      console.log('🔑 Generating Kyber key pair...');
      const newKeyPair = await generateKyberKeyPair();
      setKeyPair(newKeyPair);
      
      toast({
        title: "Keys Generated",
        description: "Mock Kyber-768 key pair generated successfully",
      });
    } catch (error) {
      console.error('Key generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Key generation failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'public' | 'private') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      
      toast({
        title: "Copied",
        description: `${type === 'public' ? 'Public' : 'Private'} key copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const testStoreKey = async () => {
    if (!keyPair) return;
    
    try {
      const mockPatientId = 'demo-patient-123';
      await storePublicKey(mockPatientId, keyPair.publicKey);
      
      toast({
        title: "Key Stored",
        description: `Public key stored for patient ${mockPatientId}`,
      });
    } catch (error) {
      toast({
        title: "Storage Failed",
        description: error instanceof Error ? error.message : "Failed to store key",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Key className="h-5 w-5" />
          Kyber Key Management Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-300 text-sm">
          Generate mock Kyber-768 key pairs for quantum-safe encryption testing.
        </p>
        
        <div className="flex gap-2">
          <Button 
            onClick={generateKeys} 
            disabled={loading}
            className="bg-autheo-primary hover:bg-autheo-primary/90"
          >
            {loading ? 'Generating...' : 'Generate Key Pair'}
          </Button>
          
          {keyPair && (
            <Button 
              onClick={testStoreKey}
              variant="outline"
              className="border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              Test Store Key
            </Button>
          )}
        </div>
        
        {keyPair && (
          <div className="space-y-4">
            {/* Public Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-800">
                    Public Key
                  </Badge>
                  {isValidKyberPublicKey(keyPair.publicKey) && (
                    <Badge variant="secondary" className="bg-blue-900/20 text-blue-400 border-blue-800">
                      Valid
                    </Badge>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(keyPair.publicKey, 'public')}
                  className="text-slate-400 hover:text-slate-200"
                >
                  {copied === 'public' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="bg-slate-700 p-3 rounded text-xs font-mono text-slate-300 max-h-20 overflow-y-auto">
                {keyPair.publicKey}
              </div>
            </div>
            
            {/* Private Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-red-900/20 text-red-400 border-red-800">
                  Private Key (Keep Secret!)
                </Badge>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(keyPair.privateKey, 'private')}
                  className="text-slate-400 hover:text-slate-200"
                >
                  {copied === 'private' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="bg-slate-700 p-3 rounded text-xs font-mono text-slate-300 max-h-20 overflow-y-auto">
                {keyPair.privateKey}
              </div>
            </div>
            
            <div className="text-xs text-slate-400 bg-slate-700/50 p-2 rounded">
              <strong>Note:</strong> These are mock keys for development. In production, use real Kyber-768 implementation with proper key derivation and storage.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}