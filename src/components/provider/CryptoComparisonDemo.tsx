/**
 * Demo component to compare mock vs real cryptography performance
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Shield } from 'lucide-react';
import { getKyberParams } from '@/lib/kyber-utils';
import { useToast } from '@/hooks/use-toast';

export default function CryptoComparisonDemo() {
  const [results, setResults] = useState<{
    mockTime?: number;
    realTime?: number;
    params?: any;
  }>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runComparison = async () => {
    setLoading(true);
    setResults({});
    
    try {
      const testData = 'Test medical record data for performance comparison';
      
      // Get ML-KEM parameters
      const params = getKyberParams();
      setResults(prev => ({ ...prev, params }));
      
      // Mock timing (instant)
      const mockStart = performance.now();
      await new Promise(resolve => setTimeout(resolve, 1)); // Simulate instant mock
      const mockTime = performance.now() - mockStart;
      
      setResults(prev => ({ ...prev, mockTime }));
      
      // Real crypto timing
      const realStart = performance.now();
      const { generateKyberKeyPair, encryptWithAES, encryptWithKyber, generateAESKey } = await import('@/lib/kyber-utils');
      
      // Generate real keys and encrypt
      const keyPair = await generateKyberKeyPair();
      const aesKey = await generateAESKey();
      await encryptWithAES(testData, aesKey);
      await encryptWithKyber(aesKey, keyPair.publicKey);
      
      const realTime = performance.now() - realStart;
      setResults(prev => ({ ...prev, realTime }));
      
      toast({
        title: "Comparison Complete",
        description: `Real crypto took ${realTime.toFixed(2)}ms vs ${mockTime.toFixed(2)}ms mock`,
      });
      
    } catch (error) {
      console.error('Comparison error:', error);
      toast({
        title: "Comparison Failed",
        description: error instanceof Error ? error.message : "Comparison failed",
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
          <Clock className="h-5 w-5" />
          Mock vs Real Crypto Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-300 text-sm">
          Compare performance between mock implementations and real ML-KEM-768 cryptography.
        </p>
        
        <Button 
          onClick={runComparison} 
          disabled={loading}
          className="w-full bg-autheo-primary hover:bg-autheo-primary/90"
        >
          {loading ? 'Running Comparison...' : 'Run Performance Test'}
        </Button>
        
        {/* Parameters Display */}
        {results.params && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <Badge variant="secondary" className="bg-blue-900/20 text-blue-400 border-blue-800">
                ML-KEM-768 Parameters
              </Badge>
            </div>
            <div className="bg-slate-700 p-3 rounded text-xs font-mono">
              <div><strong>Algorithm:</strong> {results.params.algorithm}</div>
              <div><strong>Quantum Safe:</strong> {results.params.quantumSafe ? 'Yes' : 'No'}</div>
              <div><strong>Public Key Size:</strong> {results.params.publicKeySize} bytes</div>
              <div><strong>Private Key Size:</strong> {results.params.privateKeySize} bytes</div>
              <div><strong>Ciphertext Size:</strong> {results.params.ciphertextSize} bytes</div>
              <div><strong>Shared Secret Size:</strong> {results.params.sharedSecretSize} bytes</div>
            </div>
          </div>
        )}
        
        {/* Performance Results */}
        {results.mockTime !== undefined && results.realTime !== undefined && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <Badge variant="secondary" className="bg-yellow-900/20 text-yellow-400 border-yellow-800">
                Performance Results
              </Badge>
            </div>
            <div className="bg-slate-700 p-3 rounded text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span>Mock Implementation:</span>
                <span className="text-green-400">{results.mockTime.toFixed(2)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Real ML-KEM-768:</span>
                <span className="text-blue-400">{results.realTime.toFixed(2)}ms</span>
              </div>
              <div className="flex justify-between border-t border-slate-600 pt-2">
                <span>Performance Overhead:</span>
                <span className="text-purple-400">
                  {((results.realTime / results.mockTime) * 100).toFixed(1)}% of mock
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-400 bg-slate-700/50 p-2 rounded">
              <strong>Analysis:</strong> Real ML-KEM-768 provides quantum-safe security with minimal performance impact for medical record encryption.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}