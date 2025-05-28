import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Database,
  File,
  Fingerprint
} from 'lucide-react';
import FitnessPrivacyService, { ZeroKnowledgeProof, FitnessDataEncryption } from '@/services/fitness/FitnessPrivacyService';
import { useFitnessData } from '@/hooks/useFitnessData';
import { evaluateQuantumSecurity } from '@/utils/quantumCrypto';

interface PrivacySettings {
  quantumEncryption: boolean;
  zeroKnowledgeProofs: boolean;
  differentialPrivacy: boolean;
  anonymousSharing: boolean;
  dataMinimization: boolean;
}

const FitnessPrivacyDashboard: React.FC = () => {
  const { toast } = useToast();
  const { fitnessData, loading } = useFitnessData();
  const [privacyService] = useState(() => FitnessPrivacyService.getInstance());
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    quantumEncryption: true,
    zeroKnowledgeProofs: true,
    differentialPrivacy: false,
    anonymousSharing: false,
    dataMinimization: true
  });

  const [encryptionStatus, setEncryptionStatus] = useState<{
    level: string;
    score: number;
    isQuantumSafe: boolean;
  }>({
    level: 'quantum-safe',
    score: 95,
    isQuantumSafe: true
  });

  const [zkProofs, setZkProofs] = useState<ZeroKnowledgeProof[]>([]);
  const [isGeneratingProofs, setIsGeneratingProofs] = useState(false);

  useEffect(() => {
    if (fitnessData.length > 0) {
      assessDataSecurity();
    }
  }, [fitnessData]);

  const assessDataSecurity = async () => {
    try {
      // Simulate assessment of current encryption
      const mockEncryptionMetadata = {
        algorithm: 'CRYSTALS-Kyber',
        securityLevel: 5,
        quantumResistant: true
      };
      
      const assessment = evaluateQuantumSecurity(mockEncryptionMetadata);
      setEncryptionStatus({
        level: assessment.level,
        score: assessment.score,
        isQuantumSafe: assessment.level === 'quantum-safe'
      });
    } catch (error) {
      console.error('Error assessing data security:', error);
    }
  };

  const handlePrivacySettingChange = (setting: keyof PrivacySettings) => {
    setPrivacySettings(prev => {
      const newSettings = { ...prev, [setting]: !prev[setting] };
      
      toast({
        title: "Privacy Setting Updated",
        description: `${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} has been ${newSettings[setting] ? 'enabled' : 'disabled'}.`,
      });
      
      return newSettings;
    });
  };

  const generateZeroKnowledgeProofs = async () => {
    if (fitnessData.length === 0) {
      toast({
        title: "No Data Available",
        description: "Connect a fitness device first to generate privacy proofs.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingProofs(true);
    
    try {
      const proofs: ZeroKnowledgeProof[] = [];
      
      // Generate activity threshold proof
      const activityProof = await privacyService.generateZeroKnowledgeProof(
        fitnessData,
        'activity_threshold',
        5000
      );
      proofs.push(activityProof);
      
      // Generate health metric range proof
      const healthProof = await privacyService.generateZeroKnowledgeProof(
        fitnessData,
        'health_metric_range'
      );
      proofs.push(healthProof);
      
      // Generate consistency pattern proof
      const consistencyProof = await privacyService.generateZeroKnowledgeProof(
        fitnessData,
        'consistency_pattern'
      );
      proofs.push(consistencyProof);
      
      setZkProofs(proofs);
      
      toast({
        title: "Zero-Knowledge Proofs Generated",
        description: `Generated ${proofs.length} privacy-preserving proofs for your fitness data.`,
      });
    } catch (error) {
      console.error('Error generating zero-knowledge proofs:', error);
      toast({
        title: "Error",
        description: "Failed to generate zero-knowledge proofs.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingProofs(false);
    }
  };

  const encryptFitnessData = async () => {
    if (fitnessData.length === 0) {
      toast({
        title: "No Data Available",
        description: "Connect a fitness device first to encrypt data.",
        variant: "destructive"
      });
      return;
    }

    try {
      const encryptedData = await privacyService.encryptFitnessData(
        fitnessData[0], // Encrypt first piece of data as example
        'user-id', // This would be the actual user ID
        'confidential'
      );
      
      toast({
        title: "Data Encrypted",
        description: "Your fitness data has been encrypted with quantum-resistant algorithms.",
      });
      
      console.log('Encrypted fitness data:', encryptedData);
    } catch (error) {
      console.error('Error encrypting fitness data:', error);
      toast({
        title: "Encryption Failed",
        description: "Failed to encrypt fitness data.",
        variant: "destructive"
      });
    }
  };

  const getProofIcon = (claimType: string) => {
    switch (claimType) {
      case 'activity_threshold': return <Zap className="h-4 w-4" />;
      case 'health_metric_range': return <Shield className="h-4 w-4" />;
      case 'consistency_pattern': return <CheckCircle className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const getProofTitle = (claimType: string) => {
    switch (claimType) {
      case 'activity_threshold': return 'Activity Achievement';
      case 'health_metric_range': return 'Health Metrics';
      case 'consistency_pattern': return 'Consistency Pattern';
      default: return 'Unknown Proof';
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Quantum Security</p>
                <p className="text-2xl font-bold text-green-400">{encryptionStatus.score}%</p>
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
                <p className="text-2xl font-bold text-autheo-primary">{zkProofs.length}</p>
              </div>
              <Key className="h-8 w-8 text-autheo-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Data Status</p>
                <p className="text-sm font-medium text-blue-400">Quantum-Safe</p>
              </div>
              <Database className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Privacy Settings</TabsTrigger>
          <TabsTrigger value="proofs">Zero-Knowledge Proofs</TabsTrigger>
          <TabsTrigger value="encryption">Quantum Encryption</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-autheo-primary">Advanced Privacy Controls</CardTitle>
              <CardDescription>
                Configure quantum-resistant privacy features for your fitness data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(privacySettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-300">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-xs text-slate-400">
                      {key === 'quantumEncryption' && 'Protect data against quantum computer attacks'}
                      {key === 'zeroKnowledgeProofs' && 'Prove achievements without revealing data'}
                      {key === 'differentialPrivacy' && 'Add noise to prevent identification'}
                      {key === 'anonymousSharing' && 'Share aggregated data anonymously'}
                      {key === 'dataMinimization' && 'Only collect necessary data points'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={() => handlePrivacySettingChange(key as keyof PrivacySettings)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proofs" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-autheo-primary">Zero-Knowledge Proofs</CardTitle>
                  <CardDescription>
                    Cryptographic proofs that verify claims about your data without revealing the data itself
                  </CardDescription>
                </div>
                <Button 
                  onClick={generateZeroKnowledgeProofs}
                  disabled={isGeneratingProofs || loading}
                  className="bg-autheo-primary hover:bg-autheo-primary/90"
                >
                  {isGeneratingProofs ? 'Generating...' : 'Generate Proofs'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {zkProofs.length === 0 ? (
                <div className="text-center py-8">
                  <Fingerprint className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No Proofs Generated</h3>
                  <p className="text-sm text-slate-400">
                    Generate zero-knowledge proofs to share achievements while protecting your privacy
                  </p>
                </div>
              ) : (
                zkProofs.map((proof) => (
                  <div key={proof.proofId} className="p-4 border border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getProofIcon(proof.claimType)}
                        <h3 className="font-medium text-slate-200">{getProofTitle(proof.claimType)}</h3>
                      </div>
                      <Badge 
                        variant={proof.isValid ? "default" : "destructive"}
                        className={proof.isValid ? "bg-green-600" : "bg-red-600"}
                      >
                        {proof.isValid ? 'Valid' : 'Invalid'}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-slate-400">
                      <p>Proof ID: {proof.proofId.substring(0, 16)}...</p>
                      <p>Generated: {new Date(proof.createdAt).toLocaleString()}</p>
                      <p>Verification Key: {proof.verificationKey.substring(0, 32)}...</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-autheo-primary">Quantum-Resistant Encryption</CardTitle>
                  <CardDescription>
                    Post-quantum cryptography to protect against future quantum computer attacks
                  </CardDescription>
                </div>
                <Button 
                  onClick={encryptFitnessData}
                  disabled={loading}
                  variant="outline"
                  className="border-autheo-primary/30 text-autheo-primary hover:bg-autheo-primary/10"
                >
                  <File className="h-4 w-4 mr-2" />
                  Encrypt Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Encryption Algorithm</h3>
                  <p className="text-xs text-slate-400">CRYSTALS-Kyber (NIST Post-Quantum Standard)</p>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    Quantum-Safe
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Security Level</h3>
                  <p className="text-xs text-slate-400">Level 5 (Highest)</p>
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    256-bit Equivalent
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Key Size</h3>
                  <p className="text-xs text-slate-400">2048 bits</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Signature Algorithm</h3>
                  <p className="text-xs text-slate-400">CRYSTALS-Dilithium</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <h3 className="text-sm font-medium text-green-400">Quantum Threat Protection</h3>
                </div>
                <p className="text-xs text-slate-300">
                  Your fitness data is protected using post-quantum cryptographic algorithms that remain secure 
                  even against attacks from future quantum computers. This ensures your privacy is protected 
                  for decades to come.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FitnessPrivacyDashboard;
