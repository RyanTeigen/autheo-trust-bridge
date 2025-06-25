
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Share2, Users, FileText, Lock, Zap, Eye, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RecordShareManager from '@/components/medical/sharing/RecordShareManager';
import { ShareManager } from '@/components/medical/sharing/ShareManager';
import SharedRecordsContent from './SharedRecordsContent';
import SharingManager from '@/components/patient/SharingManager';
import { useToast } from '@/hooks/use-toast';
import ShareHealthInfoDialog from '@/components/shared-records/ShareHealthInfoDialog';

const SharedRecordsTab: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [shareHealthDialog, setShareHealthDialog] = useState(false);

  const handleShareHealthInfo = () => {
    setShareHealthDialog(false);
    toast({
      title: "Health Information Shared",
      description: "Your health information has been shared securely using quantum-safe encryption.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-autheo-primary/20 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-autheo-primary" />
              </div>
              <div>
                <CardTitle className="text-autheo-primary flex items-center gap-2">
                  Shared Records & Access Management
                  <Badge variant="secondary" className="bg-autheo-primary/20 text-autheo-primary border-autheo-primary/30">
                    <Zap className="h-3 w-3 mr-1" />
                    Quantum-Safe
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Manage sharing, access permissions, and view shared records all in one place
                </CardDescription>
              </div>
            </div>
            
            <ShareHealthInfoDialog 
              open={shareHealthDialog} 
              onOpenChange={setShareHealthDialog}
              onSubmit={handleShareHealthInfo}
            />
            
            <Button 
              onClick={() => setShareHealthDialog(true)}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Quick Share
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-900/20 p-2 rounded-lg">
                <Lock className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-200">Post-Quantum Safe</h3>
                <p className="text-sm text-slate-400">ML-KEM-768 encryption</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-900/20 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-200">Granular Access</h3>
                <p className="text-sm text-slate-400">Control who sees what</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-900/20 p-2 rounded-lg">
                <Eye className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-200">Audit Trail</h3>
                <p className="text-sm text-slate-400">Track all access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-700 mb-6">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
          >
            <FileText className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="access-management"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
          >
            <Settings className="h-4 w-4 mr-2" />
            Access Control
          </TabsTrigger>
          <TabsTrigger 
            value="quantum-sharing"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
          >
            <Shield className="h-4 w-4 mr-2" />
            Quantum Sharing
          </TabsTrigger>
          <TabsTrigger 
            value="standard-sharing"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Standard Sharing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <Alert className="border-autheo-primary/30 bg-autheo-primary/10">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-slate-200">
                <strong>Consolidated Experience:</strong> All your sharing and access management tools are now in one place. 
                Choose quantum-safe sharing for maximum security or use standard sharing for traditional needs.
              </AlertDescription>
            </Alert>
            
            <SharedRecordsContent handleShareHealthInfo={handleShareHealthInfo} />
          </div>
        </TabsContent>

        <TabsContent value="access-management">
          <div className="space-y-6">
            <Alert className="border-blue-500/30 bg-blue-900/20">
              <Settings className="h-4 w-4" />
              <AlertDescription className="text-slate-200">
                <strong>Access Control:</strong> Manage who has access to your medical records. 
                You can revoke access at any time to maintain complete control over your health data.
              </AlertDescription>
            </Alert>
            
            <SharingManager />
          </div>
        </TabsContent>

        <TabsContent value="quantum-sharing">
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
        </TabsContent>

        <TabsContent value="standard-sharing">
          <div className="space-y-6">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-400">Standard Record Sharing</h3>
              </div>
              <p className="text-slate-300 text-sm">
                Use the standard sharing system to manage access to your medical records with healthcare providers. 
                This system provides secure access control with traditional encryption methods.
              </p>
            </div>
            
            <ShareManager />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharedRecordsTab;
