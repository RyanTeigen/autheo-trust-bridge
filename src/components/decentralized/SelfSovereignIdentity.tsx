
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Copy, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface Credential {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  status: 'active' | 'expired' | 'revoked';
  type: string;
}

const SelfSovereignIdentity = () => {
  const { toast } = useToast();
  const [publicKey, setPublicKey] = useState<string>('04a2f5b42d8f1c9b3e4f90d8c7b6a5e0f1d2c3b4a5');
  const [showCredentials, setShowCredentials] = useState<boolean>(false);
  
  // In a real implementation, these would be stored in a secure wallet
  const [credentials, setCredentials] = useState<Credential[]>([
    {
      id: 'cred1',
      name: 'Healthcare Provider Verification',
      issuer: 'National Medical Association',
      issuedDate: '2024-11-15',
      status: 'active',
      type: 'VerifiableCredential'
    },
    {
      id: 'cred2',
      name: 'Insurance Verification',
      issuer: 'BlueCross Insurance',
      issuedDate: '2024-12-01',
      status: 'active',
      type: 'VerifiableCredential'
    },
    {
      id: 'cred3',
      name: 'COVID-19 Vaccination',
      issuer: 'State Department of Health',
      issuedDate: '2023-06-20',
      status: 'active',
      type: 'VerifiableCredential'
    }
  ]);
  
  const handleCopyPublicKey = () => {
    navigator.clipboard.writeText(publicKey);
    toast({
      title: "Public Key Copied",
      description: "Your public key has been copied to clipboard",
    });
  };

  const handleRotateKeys = () => {
    // In a real implementation, this would generate new cryptographic keys
    setPublicKey('04e8f2c9b6a3d0e7f4c1b8a5d2e9f6c3b0a7d4e1');
    toast({
      title: "Keys Rotated",
      description: "Your cryptographic keys have been successfully rotated",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="mr-2 h-5 w-5 text-primary" /> 
          Self-Sovereign Identity
        </CardTitle>
        <CardDescription>
          Your decentralized identity that you completely control
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Your Public DID</div>
          <div className="flex items-center">
            <Input 
              value={publicKey} 
              readOnly 
              className="font-mono text-xs"
            />
            <Button 
              variant="ghost" 
              size="icon"
              className="ml-2"
              onClick={handleCopyPublicKey}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This is your decentralized identifier that others can use to verify your credentials without a central authority.
          </p>
        </div>
        
        <div className="border-t pt-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowCredentials(!showCredentials)}
          >
            {showCredentials ? 'Hide' : 'View'} Verifiable Credentials
          </Button>
        </div>
        
        {showCredentials && (
          <div className="space-y-3 mt-2">
            {credentials.map((credential) => (
              <div key={credential.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{credential.name}</h3>
                  {credential.status === 'active' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1 space-y-1">
                  <div>Issuer: {credential.issuer}</div>
                  <div>Issued: {new Date(credential.issuedDate).toLocaleDateString()}</div>
                  <div>Type: {credential.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={handleRotateKeys}>
          Rotate Keys
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => toast({
            title: "Feature in Development",
            description: "Credential management feature coming soon",
          })}
        >
          <Shield className="h-4 w-4 mr-1" />
          Manage Credentials
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SelfSovereignIdentity;
