
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SecureMessaging from '@/components/messaging/SecureMessaging';
import { Shield } from 'lucide-react';

const ProviderMessaging: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-autheo-primary">Secure Patient Communication</CardTitle>
              <CardDescription className="text-slate-300">
                Communicate securely with your patients through end-to-end encrypted messaging
              </CardDescription>
            </div>
            <div className="flex items-center px-3 py-1 rounded-full bg-autheo-primary/20 text-autheo-primary text-xs">
              <Shield className="h-3.5 w-3.5 mr-1" /> HIPAA Compliant
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <SecureMessaging isProviderView={true} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderMessaging;
