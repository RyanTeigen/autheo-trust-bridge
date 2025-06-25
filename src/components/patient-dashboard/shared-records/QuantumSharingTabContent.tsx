
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import RecordShareManager from '@/components/medical/sharing/RecordShareManager';

const QuantumSharingTabContent: React.FC = () => {
  return (
    <div className="space-y-4">
      <Alert className="border-autheo-primary/30 bg-autheo-primary/10">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-slate-200">
          <strong>Enhanced Security:</strong> Your records are protected with quantum-resistant encryption that remains secure even against future quantum computers.
        </AlertDescription>
      </Alert>
      
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-autheo-primary">How Quantum-Safe Sharing Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="bg-autheo-primary/20 p-2 rounded-full mt-1">
                <span className="text-xs font-bold text-autheo-primary">1</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-200">Select Records</h4>
                <p className="text-sm text-slate-400">Choose which medical records you want to share</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="bg-autheo-primary/20 p-2 rounded-full mt-1">
                <span className="text-xs font-bold text-autheo-primary">2</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-200">Quantum Encryption</h4>
                <p className="text-sm text-slate-400">Records are encrypted with post-quantum algorithms</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="bg-autheo-primary/20 p-2 rounded-full mt-1">
                <span className="text-xs font-bold text-autheo-primary">3</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-200">Secure Access</h4>
                <p className="text-sm text-slate-400">Recipients get secure, time-limited access</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <RecordShareManager />
    </div>
  );
};

export default QuantumSharingTabContent;
