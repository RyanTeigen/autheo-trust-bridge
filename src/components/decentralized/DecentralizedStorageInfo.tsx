
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, Lock, UserCheck, Network } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DecentralizedStorageInfo = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5 text-primary" /> 
          Decentralized Health Records
        </CardTitle>
        <CardDescription>
          How your health data is stored and protected in our decentralized system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="storage" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="storage" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="flex items-center text-sm font-medium">
                <Network className="h-4 w-4 mr-2 text-blue-600" />
                Distributed Storage Network
              </h3>
              <p className="text-sm text-muted-foreground">
                Your medical records are stored across multiple independent nodes rather than in a single central database. 
                This ensures that your data remains available even if some nodes go offline.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="flex items-center text-sm font-medium">
                <Shield className="h-4 w-4 mr-2 text-green-600" />
                Data Integrity
              </h3>
              <p className="text-sm text-muted-foreground">
                Every medical record is cryptographically signed by the provider who created it, and its integrity is 
                verified through consensus across multiple storage nodes.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="flex items-center text-sm font-medium">
                <Database className="h-4 w-4 mr-2 text-purple-600" />
                Blockchain Verification
              </h3>
              <p className="text-sm text-muted-foreground">
                References to your health records (not the actual data) are stored on a permissioned blockchain, 
                creating an immutable audit trail while keeping your actual medical data off-chain.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="flex items-center text-sm font-medium">
                <Lock className="h-4 w-4 mr-2 text-amber-600" />
                End-to-End Encryption
              </h3>
              <p className="text-sm text-muted-foreground">
                All health records are encrypted using advanced cryptography before being distributed to storage nodes.
                Only you and those you explicitly authorize can decrypt and access your complete medical information.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="flex items-center text-sm font-medium">
                <Shield className="h-4 w-4 mr-2 text-red-600" />
                No Single Point of Failure
              </h3>
              <p className="text-sm text-muted-foreground">
                Unlike traditional systems, there is no central database that can be compromised.
                Your data is split across multiple nodes, making unauthorized access exponentially more difficult.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="flex items-center text-sm font-medium">
                <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                Patient-Controlled Access
              </h3>
              <p className="text-sm text-muted-foreground">
                You control who can access your medical records and for how long. 
                Providers are granted temporary access by default, which you can extend or revoke at any time.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="flex items-center text-sm font-medium">
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                Granular Permissions
              </h3>
              <p className="text-sm text-muted-foreground">
                Set different access levels for different providers or organizations.
                Share only what's necessary for your care while keeping sensitive information private.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DecentralizedStorageInfo;
