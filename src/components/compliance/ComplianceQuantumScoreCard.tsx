import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Lock } from 'lucide-react';

const ComplianceQuantumScoreCard: React.FC = () => {
  const quantumReadinessScore = 42;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <Lock className="h-5 w-5 text-purple-400" />
          Quantum Security Readiness
        </CardTitle>
        <CardDescription>
          Post-quantum cryptography implementation status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {quantumReadinessScore}%
              </div>
              <div className="text-sm text-slate-400">Readiness Score</div>
            </div>
          </div>
        </div>
        
        <Progress 
          value={quantumReadinessScore} 
          className="h-3"
          // @ts-ignore - Custom styling for quantum theme
          style={{ 
            '--progress-background': 'hsl(var(--slate-700))',
            '--progress-foreground': 'hsl(280 100% 70%)'
          } as any}
        />
        
        <div className="space-y-2">
          <p className="text-slate-300 text-sm">
            This is a simulated score based on AES-256 encryption and comprehensive access logging. 
          </p>
          <p className="text-slate-400 text-xs">
            <strong>Upgrade to post-quantum cryptography</strong> to increase security readiness 
            and protect against future quantum computing threats.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <div className="text-green-400 font-semibold">✓ AES-256</div>
            <div className="text-xs text-slate-400">Current Standard</div>
          </div>
          <div className="text-center">
            <div className="text-amber-400 font-semibold">⚠ MLKEM</div>
            <div className="text-xs text-slate-400">Quantum-Safe</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceQuantumScoreCard;