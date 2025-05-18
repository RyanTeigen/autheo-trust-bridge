
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Upload, CheckCircle, X, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CredentialField {
  label: string;
  value: string;
  verified: boolean;
  type: 'text' | 'file';
}

interface OnchainCredential {
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'valid' | 'expired' | 'revoked';
}

const ProviderVerification: React.FC = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Provider fields state
  const [credentials, setCredentials] = useState<Record<string, CredentialField>>({
    npi: {
      label: 'NPI Number',
      value: '',
      verified: false,
      type: 'text'
    },
    license: {
      label: 'Medical License',
      value: '',
      verified: false,
      type: 'text'
    },
    licenseDoc: {
      label: 'License Document',
      value: '',
      verified: false,
      type: 'file'
    },
    dea: {
      label: 'DEA Registration',
      value: '',
      verified: false,
      type: 'text'
    }
  });
  
  // On-chain credentials that have been verified
  const [onchainCredentials, setOnchainCredentials] = useState<OnchainCredential[]>([
    {
      name: 'Board Certification',
      issuer: 'American Board of Medical Specialties',
      issuedDate: '2025-01-15',
      expiryDate: '2030-01-15',
      status: 'valid'
    }
  ]);
  
  // Overall verification status
  const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  
  const handleFieldChange = (field: string, value: string) => {
    setCredentials({
      ...credentials,
      [field]: {
        ...credentials[field],
        value
      }
    });
  };
  
  const handleFileUpload = (field: string) => {
    // Simulate file upload - in real app this would handle actual file selection
    setCredentials({
      ...credentials,
      [field]: {
        ...credentials[field],
        value: `document_${Date.now()}.pdf`
      }
    });
    
    toast({
      title: "Document Uploaded",
      description: "Your document has been uploaded and is ready for verification",
    });
  };
  
  const handleSubmit = () => {
    // Check if required fields are filled
    if (!credentials.npi.value || !credentials.license.value) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to proceed with verification",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    // Simulate API call to verify credentials
    setTimeout(() => {
      // Update credentials as verified (in real app this would be based on API response)
      const updatedCredentials = { ...credentials };
      Object.keys(updatedCredentials).forEach(key => {
        if (updatedCredentials[key].value) {
          updatedCredentials[key].verified = true;
        }
      });
      
      setCredentials(updatedCredentials);
      setVerificationStatus('pending');
      setSubmitting(false);
      setDialogOpen(true);
      
      toast({
        title: "Verification Initiated",
        description: "Your credentials have been submitted for verification",
      });
    }, 2000);
  };
  
  const getVerificationStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500"><AlertCircle className="h-3 w-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge variant="outline"><X className="h-3 w-3 mr-1" /> Unverified</Badge>;
    }
  };
  
  return (
    <>
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <CardTitle className="text-autheo-primary">Provider Verification</CardTitle>
          <CardDescription className="text-slate-300">
            Verify your credentials to establish trust with patients
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Profile section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Doctor" 
                alt="Doctor profile"
              />
              <AvatarFallback className="bg-autheo-primary text-autheo-dark">
                DR
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="text-lg font-medium">Dr. Sarah Williams</h3>
              <p className="text-slate-300">Cardiologist</p>
              <div className="mt-1">
                {getVerificationStatusBadge()}
              </div>
            </div>
          </div>
          
          {/* Verification info */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="font-medium mb-4 flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2 text-autheo-primary" />
              Verification Status
            </h4>
            
            {verificationStatus === 'unverified' ? (
              <p className="text-sm text-slate-300">
                Complete your verification process to gain patient trust and access to their records.
                This process verifies your identity as a licensed healthcare provider.
              </p>
            ) : verificationStatus === 'pending' ? (
              <p className="text-sm text-slate-300">
                Your credentials are being reviewed. This typically takes 1-3 business days.
                You'll receive a notification once verification is complete.
              </p>
            ) : (
              <p className="text-sm text-slate-300">
                You are fully verified! Patients can now see your verified status,
                improving trust and streamlining access requests.
              </p>
            )}
          </div>
          
          {/* Credentials form */}
          <div>
            <h4 className="font-medium mb-4">Provider Credentials</h4>
            
            <div className="space-y-4">
              {Object.entries(credentials).map(([key, field]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="w-40 text-sm font-medium">
                    {field.label}
                    {field.verified && (
                      <CheckCircle className="h-3 w-3 ml-1 text-green-500 inline" />
                    )}
                  </label>
                  
                  {field.type === 'text' ? (
                    <Input
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      value={field.value}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      className="flex-1 bg-slate-700 border-slate-600 text-slate-100"
                    />
                  ) : (
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="No file selected"
                        value={field.value}
                        readOnly
                        className="flex-1 bg-slate-700 border-slate-600 text-slate-100"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => handleFileUpload(key)}
                        className="border-autheo-primary/30 bg-slate-800 text-autheo-primary hover:bg-slate-700"
                      >
                        <Upload className="h-4 w-4 mr-1" /> Upload
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* On-chain credentials */}
          {onchainCredentials.length > 0 && (
            <div>
              <h4 className="font-medium mb-4">On-Chain Credentials</h4>
              
              <div className="space-y-3">
                {onchainCredentials.map((credential, index) => (
                  <div key={index} className="bg-slate-700/30 p-3 rounded-md">
                    <div className="flex justify-between items-start">
                      <h5 className="font-medium">{credential.name}</h5>
                      {credential.status === 'valid' ? (
                        <Badge className="bg-green-600">Valid</Badge>
                      ) : credential.status === 'expired' ? (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500">Expired</Badge>
                      ) : (
                        <Badge variant="destructive">Revoked</Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-300">Issuer: {credential.issuer}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Issued: {credential.issuedDate}
                      {credential.expiryDate && ` • Expires: ${credential.expiryDate}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleSubmit}
            disabled={submitting || verificationStatus === 'pending'}
            className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
          >
            {submitting ? 'Submitting...' : (
              verificationStatus === 'pending' ? 'Awaiting Verification' : (
                verificationStatus === 'verified' ? 'Resubmit Credentials' : 'Verify Credentials'
              )
            )}
          </Button>
        </CardContent>
        
        <CardFooter className="bg-slate-700/30 border-t border-slate-700 px-6 py-4 text-xs text-slate-400">
          <div className="flex items-center">
            <ShieldCheck className="h-4 w-4 mr-1.5 text-autheo-primary" /> 
            Verification status is cryptographically stored on the blockchain for transparency and trust
          </div>
        </CardFooter>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Verification Initiated</DialogTitle>
            <DialogDescription className="text-slate-300">
              Your credentials have been submitted for verification
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="rounded-lg p-4 bg-slate-700/50 flex items-center gap-3">
              <div className="bg-yellow-500/20 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h4 className="font-medium text-slate-100">Verification in Progress</h4>
                <p className="text-sm text-slate-300 mt-1">
                  Your verification is being processed. This typically takes 1-3 business days.
                  You'll be notified once complete.
                </p>
              </div>
            </div>
            
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>During verification, we check:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>License authenticity with state medical boards</li>
                <li>NPI number against national database</li>
                <li>DEA registration (if applicable)</li>
                <li>Board certifications and qualifications</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setDialogOpen(false)}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProviderVerification;
