
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Key, Database } from 'lucide-react';

interface SecurityStatusCardsProps {
  encryptionScore: number;
  zkProofCount: number;
  auditLogCount: number;
}

const SecurityStatusCards: React.FC<SecurityStatusCardsProps> = ({
  encryptionScore,
  zkProofCount,
  auditLogCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Quantum Security</p>
              <p className="text-2xl font-bold text-green-400">{encryptionScore}%</p>
            </div>
            <Shield className="h-8 w-8 text-green-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Privacy Proofs</p>
              <p className="text-2xl font-bold text-autheo-primary">{zkProofCount}</p>
            </div>
            <Key className="h-8 w-8 text-autheo-primary" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Audit Events</p>
              <p className="text-2xl font-bold text-blue-400">{auditLogCount}</p>
            </div>
            <Database className="h-8 w-8 text-blue-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityStatusCards;
