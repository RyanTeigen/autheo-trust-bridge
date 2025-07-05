import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Key,
  Lock,
  Zap,
  Activity,
  RotateCcw,
  FileSignature,
  Database
} from 'lucide-react';
import { getKyberHealthStatus, initializeKyberSubsystem } from '@/utils/kyber-health';
import { getKyberParams } from '@/utils/pq-kyber';
import { quantumKeyManager } from '@/services/security/QuantumKeyManager';
import { HybridEncryptionService } from '@/services/security/HybridEncryptionService';
import { QuantumDigitalSignatures } from '@/services/security/QuantumDigitalSignatures';
import QuantumEncryptionIndicator from './QuantumEncryptionIndicator';

interface SecurityMetric {
  name: string;
  value: string | number;
  status: 'good' | 'warning' | 'error';
  description: string;
  icon: React.ReactNode;
}

const QuantumSecurityStatus: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [kyberParams, setKyberParams] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [keyManagerStatus, setKeyManagerStatus] = useState<any>(null);
  const [hybridEncryptionBenchmark, setHybridEncryptionBenchmark] = useState<any>(null);
  const [digitalSignatureStatus, setDigitalSignatureStatus] = useState<any>(null);

  useEffect(() => {
    const initializeAndCheck = async () => {
      try {
        setLoading(true);
        
        // Initialize Kyber subsystem
        const initialized = await initializeKyberSubsystem();
        setIsInitialized(initialized);
        
        // Get Kyber parameters
        const params = getKyberParams();
        setKyberParams(params);
        
        // Get health status
        const health = getKyberHealthStatus();
        setHealthStatus(health);

        // Initialize Key Manager
        try {
          const keyManagerResult = await quantumKeyManager.initialize();
          const rotationCheck = await quantumKeyManager.checkKeyRotationNeeded();
          setKeyManagerStatus({ ...keyManagerResult, ...rotationCheck });
        } catch (error) {
          console.error('Key manager initialization failed:', error);
          setKeyManagerStatus({ success: false, error: 'Key manager unavailable' });
        }

        // Benchmark Hybrid Encryption
        try {
          const benchmark = await HybridEncryptionService.benchmarkPerformance('Test data for benchmarking', 3);
          setHybridEncryptionBenchmark(benchmark);
        } catch (error) {
          console.error('Hybrid encryption benchmark failed:', error);
          setHybridEncryptionBenchmark({ error: 'Benchmark unavailable' });
        }

        // Check Digital Signatures
        try {
          const signingKeys = QuantumDigitalSignatures.getAllSigningKeysMetadata();
          setDigitalSignatureStatus({ 
            available: true, 
            keyCount: signingKeys.length,
            keys: signingKeys
          });
        } catch (error) {
          console.error('Digital signature check failed:', error);
          setDigitalSignatureStatus({ available: false, error: 'Digital signatures unavailable' });
        }

      } catch (error) {
        console.error('Error initializing quantum security status:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAndCheck();
  }, []);

  const getSecurityMetrics = (): SecurityMetric[] => {
    if (!healthStatus || !kyberParams) return [];

    return [
      {
        name: 'Quantum Resistance',
        value: kyberParams.quantumSafe ? 'Enabled' : 'Disabled',
        status: kyberParams.quantumSafe ? 'good' : 'error',
        description: 'Post-quantum cryptographic protection status',
        icon: <Shield className="h-4 w-4" />
      },
      {
        name: 'Kyber Implementation',
        value: kyberParams.available ? 'Available' : 'Fallback',
        status: kyberParams.available ? 'good' : 'warning',
        description: 'Kyber KEM implementation availability',
        icon: <Key className="h-4 w-4" />
      },
      {
        name: 'Key Generation',
        value: healthStatus.keyGenWorking ? 'Operational' : 'Failed',
        status: healthStatus.keyGenWorking ? 'good' : 'error',
        description: 'Quantum-safe key generation capability',
        icon: <Key className="h-4 w-4" />
      },
      {
        name: 'Encryption',
        value: healthStatus.encryptionWorking ? 'Operational' : 'Failed',
        status: healthStatus.encryptionWorking ? 'good' : 'error',
        description: 'Post-quantum encryption functionality',
        icon: <Lock className="h-4 w-4" />
      },
      {
        name: 'Decryption',
        value: healthStatus.decryptionWorking ? 'Operational' : 'Failed',
        status: healthStatus.decryptionWorking ? 'good' : 'error',
        description: 'Post-quantum decryption functionality',
        icon: <Lock className="h-4 w-4" />
      },
      {
        name: 'Performance',
        value: healthStatus.averageEncryptTime ? `${healthStatus.averageEncryptTime.toFixed(1)}ms` : 'N/A',
        status: healthStatus.averageEncryptTime < 100 ? 'good' : 'warning',
        description: 'Average encryption performance',
        icon: <Zap className="h-4 w-4" />
      }
    ];
  };

  const getOverallStatus = (): { level: 'legacy' | 'quantum-safe' | 'post-quantum' | 'hybrid'; score: number } => {
    if (!healthStatus) return { level: 'legacy', score: 0 };
    
    if (healthStatus.operational && kyberParams?.quantumSafe) {
      return { level: 'quantum-safe', score: 95 };
    } else if (healthStatus.operational) {
      return { level: 'hybrid', score: 75 };
    } else {
      return { level: 'legacy', score: 30 };
    }
  };

  const metrics = getSecurityMetrics();
  const overallStatus = getOverallStatus();
  const goodCount = metrics.filter(m => m.status === 'good').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;
  const errorCount = metrics.filter(m => m.status === 'error').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            Quantum Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quantum Security Status
            </CardTitle>
            <QuantumEncryptionIndicator
              securityLevel={overallStatus.level}
              score={overallStatus.score}
              algorithm={kyberParams?.algorithm}
              showDetails={true}
              size="lg"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isInitialized && (
            <Alert className="bg-destructive/10 border-destructive/30">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-destructive-foreground">
                <strong>⚠️ MOCK DATA WARNING:</strong> Real quantum cryptography is not available. 
                All metrics shown are simulated for demonstration purposes only. 
                This is NOT providing actual quantum security.
              </AlertDescription>
            </Alert>
          )}
          
          {isInitialized && (
            <Alert className="bg-primary/10 border-primary/30">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-primary-foreground">
                ✅ Real quantum cryptography is operational and protecting your data.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                <span className="font-medium">{goodCount}</span> Operational
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm">
                <span className="font-medium">{warningCount}</span> Warnings
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm">
                <span className="font-medium">{errorCount}</span> Errors
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name} className="transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    metric.status === 'good' ? 'bg-green-100 text-green-600' :
                    metric.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {metric.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {metric.name}
                      {!isInitialized && <span className="text-xs text-destructive ml-2">(MOCK)</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                </div>
                <Badge 
                  variant={metric.status === 'good' ? 'default' : 'destructive'}
                  className={
                    metric.status === 'good' ? 'bg-green-100 text-green-700' :
                    metric.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }
                >
                  {metric.value}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {healthStatus?.errors && healthStatus.errors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {healthStatus.errors.map((error: string, index: number) => (
                <li key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {kyberParams && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Algorithm:</span> {kyberParams.algorithm}
              </div>
              <div>
                <span className="font-medium">Implementation:</span> {kyberParams.implementation}
              </div>
              <div>
                <span className="font-medium">Quantum Safe:</span> {kyberParams.quantumSafe ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Library Available:</span> {kyberParams.available ? 'Yes' : 'No'}
              </div>
              {healthStatus?.lastCheck && (
                <div className="md:col-span-2">
                  <span className="font-medium">Last Health Check:</span> {new Date(healthStatus.lastCheck).toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Management Status */}
      {keyManagerStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Key Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={keyManagerStatus.success ? 'default' : 'destructive'}>
                  {keyManagerStatus.success ? 'Operational' : 'Error'}
                </Badge>
              </div>
              {keyManagerStatus.currentKey && (
                <div className="text-sm text-muted-foreground">
                  Key ID: {keyManagerStatus.currentKey.id}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hybrid Encryption Status */}
      {hybridEncryptionBenchmark && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Hybrid Encryption
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hybridEncryptionBenchmark.error ? (
              <div className="text-sm text-muted-foreground">{hybridEncryptionBenchmark.error}</div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Encrypt: {hybridEncryptionBenchmark.averageEncryptTime?.toFixed(1)}ms</div>
                <div>Decrypt: {hybridEncryptionBenchmark.averageDecryptTime?.toFixed(1)}ms</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Digital Signatures Status */}
      {digitalSignatureStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              Digital Signatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Available:</span>
                <Badge variant={digitalSignatureStatus.available ? 'default' : 'destructive'}>
                  {digitalSignatureStatus.available ? 'Yes' : 'No'}
                </Badge>
              </div>
              {digitalSignatureStatus.keyCount !== undefined && (
                <div className="text-sm text-muted-foreground">
                  Signing Keys: {digitalSignatureStatus.keyCount}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuantumSecurityStatus;
