
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Hash, Clock, ExternalLink, Lock } from 'lucide-react';
import AuditHashManager from './AuditHashManager';

const BlockchainAuditTrail: React.FC = () => {
  // Mock data for demonstration
  const recentAnchors = [
    {
      id: '1',
      hash: 'a7f5f35426b927411fc9231b56382173d10e4c6b2e8a',
      logCount: 47,
      timestamp: '2024-06-25T10:30:00Z',
      blockchainTxHash: '0x742d35cc7d6b8462b14d3cdc8e5d7e1e36890b8c1f9e',
      blockHeight: 1234567,
      network: 'autheo-mainnet'
    },
    {
      id: '2',
      hash: 'b8e6e46537c038522efd2452674829284251e7d3f4f1',
      logCount: 33,
      timestamp: '2024-06-25T09:15:00Z',
      blockchainTxHash: '0x853e46dd8e7c9573c25e4ede9f6e8f2f47991c9d2e0f',
      blockHeight: 1234542,
      network: 'autheo-mainnet'
    }
  ];

  return (
    <div className="space-y-6">
      <AuditHashManager />
      
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blockchain Audit Trail
          </CardTitle>
          <CardDescription>
            Immutable audit log anchors stored on the Autheo blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAnchors.length === 0 ? (
              <div className="text-center py-8">
                <Lock className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">No Blockchain Anchors</h3>
                <p className="text-sm text-slate-400">
                  Generate and anchor audit hashes to create immutable audit trails
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnchors.map((anchor) => (
                  <div
                    key={anchor.id}
                    className="p-4 border border-slate-700 rounded-lg bg-slate-800/30 hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-autheo-primary" />
                        <span className="text-sm font-medium text-slate-200">
                          Audit Hash Anchor
                        </span>
                      </div>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Confirmed
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Hash:</span>
                        <span className="font-mono text-slate-300 truncate ml-2 max-w-xs">
                          {anchor.hash}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Transaction:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-slate-300 truncate max-w-xs">
                            {anchor.blockchainTxHash}
                          </span>
                          <ExternalLink className="h-3 w-3 text-slate-400" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Block:</span>
                        <span className="text-slate-300">#{anchor.blockHeight}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Logs Covered:</span>
                        <span className="text-slate-300">{anchor.logCount} entries</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Anchored:</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-300">
                            {new Date(anchor.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockchainAuditTrail;
