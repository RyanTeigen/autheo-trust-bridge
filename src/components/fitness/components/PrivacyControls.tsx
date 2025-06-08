
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';

interface PrivacyControlsProps {
  privacyMode: boolean;
  onTogglePrivacyMode: () => void;
}

const PrivacyControls: React.FC<PrivacyControlsProps> = ({
  privacyMode,
  onTogglePrivacyMode
}) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-autheo-primary">Fitness Data Privacy</CardTitle>
            <CardDescription className="text-sm">
              Control how your fitness data is displayed and protected
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePrivacyMode}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {privacyMode ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Privacy Mode: ON
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Privacy Mode: OFF
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-slate-300">Quantum Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-400" />
            <span className="text-slate-300">Zero-Knowledge Proofs Available</span>
          </div>
          <Badge variant="outline" className="text-green-400 border-green-400">
            HIPAA Compliant
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacyControls;
