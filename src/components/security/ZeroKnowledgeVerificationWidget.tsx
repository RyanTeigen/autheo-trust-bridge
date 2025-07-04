import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Lock,
  Fingerprint,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ZeroKnowledgeService } from '@/services/security/ZeroKnowledgeService';
import { ClientSideEncryptionService } from '@/services/security/ClientSideEncryptionService';
import { SecureKeyManager } from '@/services/security/SecureKeyManager';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SecurityStatus {
  webAuthnSupported: boolean;
  hasSecureKeys: boolean;
  keyStorageType: 'hardware' | 'software' | 'none';
  encryptionStatus: 'zero_knowledge' | 'hybrid' | 'legacy';
  attestationValid: boolean;
}

const ZeroKnowledgeVerificationWidget: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (user) {
      checkSecurityStatus();
    }
  }, [user]);

  const checkSecurityStatus = async () => {
    try {
      setLoading(true);

      // Check WebAuthn support
      const webAuthnSupported = SecureKeyManager.isWebAuthnSupported();

      // Check if user has keys
      const keyRef = user ? await SecureKeyManager.getKeyReference(user.id) : null;
      const hasSecureKeys = !!keyRef;

      // Determine key storage type
      let keyStorageType: 'hardware' | 'software' | 'none' = 'none';
      if (keyRef?.hasSecureStorage) {
        keyStorageType = 'hardware';
      } else if (keyRef) {
        keyStorageType = 'software';
      }

      // Check attestation
      const attestation = user ? await SecureKeyManager.getKeyAttestation(user.id) : null;
      const attestationValid = !!attestation?.verified;

      // Check zero-knowledge status
      const zkVerification = await ZeroKnowledgeService.verifyZeroKnowledge();
      const encryptionStatus: 'zero_knowledge' | 'hybrid' | 'legacy' = 
        zkVerification.isZeroKnowledge ? 'zero_knowledge' : 
        hasSecureKeys ? 'hybrid' : 'legacy';

      setStatus({
        webAuthnSupported,
        hasSecureKeys,
        keyStorageType,
        encryptionStatus,
        attestationValid
      });

    } catch (error) {
      console.error('Error checking security status:', error);
      toast({
        title: "Error",
        description: "Failed to check security status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const upgradeToZeroKnowledge = async () => {
    if (!user) return;

    try {
      setUpgrading(true);

      // Generate secure keys
      const keys = await ClientSideEncryptionService.generateUserKeys(user.id);

      toast({
        title: "Security Upgraded",
        description: `Your encryption has been upgraded to ${keys.hasSecureStorage ? 'hardware-backed' : 'software-based'} zero-knowledge encryption.`,
      });

      // Refresh status
      await checkSecurityStatus();

    } catch (error) {
      console.error('Error upgrading security:', error);
      toast({
        title: "Upgrade Failed",
        description: "Failed to upgrade to zero-knowledge encryption",
        variant: "destructive"
      });
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Shield className="h-5 w-5 text-autheo-primary" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const getSecurityLevel = () => {
    if (status.encryptionStatus === 'zero_knowledge' && status.keyStorageType === 'hardware') {
      return { level: 'Maximum', color: 'text-green-400', icon: ShieldCheck };
    } else if (status.encryptionStatus === 'zero_knowledge') {
      return { level: 'High', color: 'text-blue-400', icon: Shield };
    } else if (status.hasSecureKeys) {
      return { level: 'Medium', color: 'text-yellow-400', icon: ShieldAlert };
    } else {
      return { level: 'Basic', color: 'text-red-400', icon: ShieldAlert };
    }
  };

  const security = getSecurityLevel();
  const SecurityIcon = security.icon;

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <SecurityIcon className={`h-5 w-5 ${security.color}`} />
            End-to-End Encryption Status
          </CardTitle>
          <CardDescription>
            Your current encryption security level and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Security Level Badge */}
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Security Level:</span>
            <Badge 
              variant={security.level === 'Maximum' ? 'default' : 'secondary'}
              className={`${
                security.level === 'Maximum' 
                  ? 'bg-green-900/20 text-green-400 border-green-800'
                  : security.level === 'High'
                  ? 'bg-blue-900/20 text-blue-400 border-blue-800'
                  : security.level === 'Medium'
                  ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800'
                  : 'bg-red-900/20 text-red-400 border-red-800'
              }`}
            >
              {security.level}
            </Badge>
          </div>

          {/* Security Features */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300">WebAuthn Support</span>
              </div>
              {status.webAuthnSupported ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300">Secure Key Storage</span>
              </div>
              <Badge variant="outline" className={`
                ${status.keyStorageType === 'hardware' 
                  ? 'border-green-600 text-green-400'
                  : status.keyStorageType === 'software'
                  ? 'border-yellow-600 text-yellow-400'
                  : 'border-red-600 text-red-400'
                }
              `}>
                {status.keyStorageType === 'hardware' ? 'Hardware' : 
                 status.keyStorageType === 'software' ? 'Software' : 'None'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300">Encryption Type</span>
              </div>
              <Badge variant="outline" className={`
                ${status.encryptionStatus === 'zero_knowledge' 
                  ? 'border-green-600 text-green-400'
                  : status.encryptionStatus === 'hybrid'
                  ? 'border-yellow-600 text-yellow-400'
                  : 'border-red-600 text-red-400'
                }
              `}>
                {status.encryptionStatus === 'zero_knowledge' ? 'Zero-Knowledge' : 
                 status.encryptionStatus === 'hybrid' ? 'Hybrid' : 'Legacy'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300">Key Attestation</span>
              </div>
              {status.attestationValid ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
            </div>
          </div>

          {/* Upgrade Button */}
          {status.encryptionStatus !== 'zero_knowledge' && (
            <Button
              onClick={upgradeToZeroKnowledge}
              disabled={upgrading}
              className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
            >
              {upgrading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
                  Upgrading Security...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Upgrade to Zero-Knowledge
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      {(status.encryptionStatus !== 'zero_knowledge' || !status.webAuthnSupported) && (
        <Alert className="bg-amber-900/20 border-amber-500/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-amber-200">
            <strong>Security Recommendations:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              {!status.webAuthnSupported && (
                <li>• Use a modern browser with WebAuthn support for hardware-backed encryption</li>
              )}
              {status.encryptionStatus !== 'zero_knowledge' && (
                <li>• Upgrade to zero-knowledge encryption for maximum privacy</li>
              )}
              {!status.attestationValid && (
                <li>• Enable key attestation for improved security verification</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {status.encryptionStatus === 'zero_knowledge' && status.keyStorageType === 'hardware' && (
        <Alert className="bg-green-900/20 border-green-500/30">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-200">
            <strong>Maximum Security Active:</strong> Your medical records are protected with hardware-backed, 
            zero-knowledge encryption. The server never has access to your plaintext data.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ZeroKnowledgeVerificationWidget;