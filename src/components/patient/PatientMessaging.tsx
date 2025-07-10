import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Shield } from 'lucide-react';
import SecureMessaging from '@/components/messaging/SecureMessaging';

const PatientMessaging: React.FC = () => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-autheo-primary to-autheo-secondary p-2.5 rounded-lg shadow-md">
            <MessageCircle className="h-6 w-6 text-autheo-dark" />
          </div>
          <div>
            <CardTitle className="text-autheo-primary">Secure Messaging</CardTitle>
            <CardDescription className="text-slate-300">
              Communicate securely with your healthcare providers
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Shield className="h-4 w-4 text-autheo-primary" />
          <span className="text-xs text-slate-400">All messages are encrypted and HIPAA compliant</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <SecureMessaging isProviderView={false} />
      </CardContent>
    </Card>
  );
};

export default PatientMessaging;