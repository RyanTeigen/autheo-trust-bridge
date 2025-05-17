
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ProofRequest {
  id: string;
  type: string;
  requestor: string;
  status: 'pending' | 'approved' | 'denied';
  description: string;
  dataRequested: string[];
}

const ZeroKnowledgeVerification = () => {
  const { toast } = useToast();
  
  // This would come from the blockchain in a real implementation
  const [proofRequests, setProofRequests] = useState<ProofRequest[]>([
    {
      id: 'proof1',
      type: 'ageVerification',
      requestor: 'Insurance Provider',
      status: 'pending',
      description: 'Verify you are over 18 without revealing your birth date',
      dataRequested: ['Age > 18']
    },
    {
      id: 'proof2',
      type: 'vaccinationStatus',
      requestor: 'Employer',
      status: 'approved',
      description: 'Verify COVID-19 vaccination status without revealing medical details',
      dataRequested: ['COVID-19 Vaccination Status']
    },
    {
      id: 'proof3',
      type: 'insuranceCoverage',
      requestor: 'Medical Lab',
      status: 'pending',
      description: 'Verify you have active insurance coverage without revealing policy details',
      dataRequested: ['Insurance Active Status']
    }
  ]);
  
  const handleApproveProof = (id: string) => {
    setProofRequests(proofRequests.map(request => 
      request.id === id ? { ...request, status: 'approved' } : request
    ));
    
    toast({
      title: "Proof Shared",
      description: "Verification proof was cryptographically shared without revealing your data",
    });
  };
  
  const handleDenyProof = (id: string) => {
    setProofRequests(proofRequests.map(request => 
      request.id === id ? { ...request, status: 'denied' } : request
    ));
    
    toast({
      title: "Request Denied",
      description: "The verification request has been denied",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" /> 
          Zero-Knowledge Verification
        </CardTitle>
        <CardDescription>
          Share verification proofs without revealing your actual data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {proofRequests.length === 0 ? (
            <div className="text-center py-6">
              <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">No verification requests</h3>
              <p className="text-muted-foreground mt-1">
                When providers need verification, requests will appear here
              </p>
            </div>
          ) : (
            proofRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{request.description}</h3>
                  {request.status === 'approved' && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  )}
                  {request.status === 'denied' && (
                    <Badge variant="outline" className="text-red-500 border-red-500">
                      Denied
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">From:</span> {request.requestor}
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  <span className="font-medium">Data to verify:</span>{' '}
                  {request.dataRequested.join(', ')}
                </div>
                
                {request.status === 'pending' && (
                  <div className="flex space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleApproveProof(request.id)}
                    >
                      Share Proof
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDenyProof(request.id)}
                    >
                      Deny
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div className="bg-muted rounded-md p-2 w-full">
          <p>Zero-knowledge proofs allow you to prove facts about your health data without revealing the data itself.</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ZeroKnowledgeVerification;
