
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Share2, Eye } from 'lucide-react';
import RecordShareManager from '@/components/medical/sharing/RecordShareManager';
import { useToast } from '@/hooks/use-toast';

const SharedRecordsPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('quantum-shares');

  const handleShareHealthInfo = () => {
    toast({
      title: "Health Information Shared",
      description: "Your health information has been shared securely using quantum-safe encryption.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-autheo-primary flex items-center gap-3">
              <Shield className="h-8 w-8" />
              Shared Records
            </h1>
            <p className="text-slate-300 mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Quantum-Safe Encryption
              </Badge>
              Securely share your medical records with healthcare providers and authorized users
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-slate-800">
            <TabsTrigger 
              value="quantum-shares" 
              className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Quantum-Safe Sharing
            </TabsTrigger>
            <TabsTrigger 
              value="legacy-shares" 
              className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Legacy Sharing
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="quantum-shares" className="mt-0">
            <div className="space-y-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-autheo-primary" />
                  <h3 className="text-lg font-semibold text-autheo-primary">Post-Quantum Security</h3>
                </div>
                <p className="text-slate-300 text-sm">
                  This sharing system uses ML-KEM (Module-Lattice-Based Key Encapsulation Mechanism) to protect your medical records 
                  against both classical and quantum computer attacks. Your data remains secure even as quantum computing advances.
                </p>
              </div>
              
              <RecordShareManager />
            </div>
          </TabsContent>
          
          <TabsContent value="legacy-shares" className="mt-0">
            <div className="space-y-6">
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="h-5 w-5 text-amber-400" />
                  <h3 className="text-lg font-semibold text-amber-400">Legacy Sharing System</h3>
                </div>
                <p className="text-slate-300 text-sm">
                  The legacy sharing system uses traditional encryption methods. While still secure for current threats, 
                  we recommend using the quantum-safe sharing system for future-proof protection.
                </p>
              </div>
              
              {/* This would contain the legacy sharing components */}
              <div className="text-center py-8 text-slate-400">
                <p>Legacy sharing features will be displayed here.</p>
                <p className="text-sm mt-2">Consider upgrading to quantum-safe sharing for enhanced security.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SharedRecordsPage;
