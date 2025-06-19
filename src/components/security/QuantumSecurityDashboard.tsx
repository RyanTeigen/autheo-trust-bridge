
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TestTube, Activity, Settings } from 'lucide-react';
import PostQuantumVerification from './PostQuantumVerification';
import QuantumSecurityStatus from './QuantumSecurityStatus';
import QuantumEncryptionIndicator from './QuantumEncryptionIndicator';

const QuantumSecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('status');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Quantum Security Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Monitor and verify your post-quantum cryptographic security implementations.
            This dashboard provides comprehensive testing and status monitoring for quantum-safe encryption.
          </p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-6">
          <QuantumSecurityStatus />
        </TabsContent>

        <TabsContent value="verification" className="mt-6">
          <PostQuantumVerification />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuantumSecurityDashboard;
