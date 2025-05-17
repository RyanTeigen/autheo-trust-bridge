
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Lock, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProofRequest {
  id: string;
  type: string;
  requestor: string;
  status: 'pending' | 'approved' | 'denied';
  description: string;
  dataRequested: string[];
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
}

const ZeroKnowledgeVerification: React.FC = () => {
  const { toast } = useToast();
  
  // This would come from the blockchain in a real implementation
  const [proofRequests, setProofRequests] = useState<ProofRequest[]>([
    {
      id: 'proof1',
      type: 'hipaaVerification',
      requestor: 'Compliance Auditor',
      status: 'pending',
      description: 'Verify HIPAA policies implementation without revealing internal systems',
      dataRequested: ['Security Controls', 'Policy Implementation'],
      deadline: '2025-06-01',
      priority: 'high'
    },
    {
      id: 'proof2',
      type: 'accessControlVerification',
      requestor: 'Security Assessor',
      status: 'approved',
      description: 'Verify access control systems are properly implemented',
      dataRequested: ['Role-based Access', 'Authentication Methods'],
      priority: 'medium'
    },
    {
      id: 'proof3',
      type: 'policyAdherence',
      requestor: 'Internal Audit',
      status: 'pending',
      description: 'Verify staff training compliance without revealing PII',
      dataRequested: ['Training Completion', 'Knowledge Assessment'],
      deadline: '2025-05-25',
      priority: 'low'
    }
  ]);
  
  const handleApproveProof = (id: string) => {
    setProofRequests(proofRequests.map(request => 
      request.id === id ? { ...request, status: 'approved' } : request
    ));
    
    toast({
      title: "Proof Shared",
      description: "Verification proof was cryptographically shared without revealing protected data",
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

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'text-red-600 border-red-600';
      case 'medium': return 'text-amber-600 border-amber-600';
      case 'low': return 'text-green-600 border-green-600';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" /> 
          Zero-Knowledge Compliance Verification
        </CardTitle>
        <CardDescription>
          Share verification proofs without revealing sensitive compliance data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {proofRequests.length === 0 ? (
            <div className="text-center py-6">
              <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">No verification requests</h3>
              <p className="text-muted-foreground mt-1">
                When auditors need verification, requests will appear here
              </p>
            </div>
          ) : (
            proofRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{request.description}</h3>
                  {request.status === 'approved' && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  )}
                  {request.status === 'denied' && (
                    <Badge variant="outline" className="text-red-500 border-red-500">
                      Denied
                    </Badge>
                  )}
                  {request.status === 'pending' && (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">From:</span> {request.requestor}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">Verification type:</span> {request.type}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={getPriorityColor(request.priority)}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                  </Badge>
                  
                  {request.deadline && (
                    <div className="flex items-center text-xs">
                      <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                      Due: {request.deadline}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  <span className="font-medium">Data to verify (without revealing):</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {request.dataRequested.map(item => (
                      <Badge variant="secondary" key={item} className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {request.status === 'pending' && (
                  <div className="flex space-x-2 mt-3">
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleApproveProof(request.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Generate Zero-Knowledge Proof
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDenyProof(request.id)}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="bg-muted rounded-md p-3 w-full text-sm space-y-2">
          <div className="flex items-start">
            <Lock className="h-4 w-4 mr-2 mt-0.5 text-primary" />
            <p>Zero-knowledge proofs allow you to prove compliance without revealing sensitive implementation details.</p>
          </div>
          <div className="flex items-start">
            <Shield className="h-4 w-4 mr-2 mt-0.5 text-primary" />
            <p>Cryptographically secure verification maintains confidentiality while satisfying auditor requirements.</p>
          </div>
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
            <p>Always consult with your compliance officer before sharing any verification proofs.</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ZeroKnowledgeVerification;
