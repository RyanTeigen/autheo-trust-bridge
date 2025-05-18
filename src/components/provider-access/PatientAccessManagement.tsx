
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, Clock, Check, X, Unlock, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AccessRequest {
  id: string;
  provider: {
    id: string;
    name: string;
    specialty?: string;
    organization?: string;
    verificationStatus: 'verified' | 'pending' | 'unverified';
  };
  requestDate: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  reason: string;
  duration: number; // in days
  dataRequested: string[];
}

const PatientAccessManagement: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'denied'>('pending');
  
  // Mock data - in a real app this would come from the blockchain/database
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([
    {
      id: 'req1',
      provider: {
        id: 'doc1',
        name: 'Dr. Emily Chen',
        specialty: 'Cardiology',
        organization: 'Memorial Hospital',
        verificationStatus: 'verified'
      },
      requestDate: '2025-05-16',
      status: 'pending',
      reason: 'Annual check-up and review of recent bloodwork',
      duration: 30,
      dataRequested: ['Medications', 'Lab Results', 'Vital Signs']
    },
    {
      id: 'req2',
      provider: {
        id: 'doc2',
        name: 'Dr. Marcus Johnson',
        specialty: 'General Practice',
        organization: 'City Clinic',
        verificationStatus: 'verified'
      },
      requestDate: '2025-05-15',
      status: 'pending',
      reason: 'Follow-up on recent urgent care visit',
      duration: 14,
      dataRequested: ['Recent Visits', 'Medications']
    },
    {
      id: 'req3',
      provider: {
        id: 'doc3',
        name: 'Dr. Sarah Williams',
        specialty: 'Neurology',
        organization: 'University Medical Center',
        verificationStatus: 'verified'
      },
      requestDate: '2025-05-10',
      status: 'approved',
      reason: 'Ongoing treatment for chronic condition',
      duration: 90,
      dataRequested: ['Full Medical History', 'Imaging', 'Lab Results', 'Medications']
    },
    {
      id: 'req4',
      provider: {
        id: 'doc4',
        name: 'Dr. James Lee',
        specialty: 'Dermatology',
        verificationStatus: 'pending'
      },
      requestDate: '2025-05-05',
      status: 'denied',
      reason: 'Consultation for skin condition',
      duration: 7,
      dataRequested: ['Dermatology Records']
    }
  ]);
  
  // Filter requests by search query and status
  const filteredRequests = accessRequests.filter(request => {
    const matchesSearch = 
      request.provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.provider.specialty && request.provider.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.provider.organization && request.provider.organization.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      (activeTab === 'pending' && request.status === 'pending') ||
      (activeTab === 'approved' && request.status === 'approved') ||
      (activeTab === 'denied' && (request.status === 'denied' || request.status === 'expired'));
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle approving an access request
  const handleApprove = (requestId: string) => {
    setAccessRequests(accessRequests.map(request => 
      request.id === requestId ? { ...request, status: 'approved' } : request
    ));
    
    toast({
      title: "Access Approved",
      description: "Provider access has been granted securely on the blockchain",
    });
  };
  
  // Handle denying an access request
  const handleDeny = (requestId: string) => {
    setAccessRequests(accessRequests.map(request => 
      request.id === requestId ? { ...request, status: 'denied' } : request
    ));
    
    toast({
      title: "Access Denied",
      description: "Provider access request has been rejected",
    });
  };
  
  // Handle revoking previously approved access
  const handleRevoke = (requestId: string) => {
    setAccessRequests(accessRequests.map(request => 
      request.id === requestId ? { ...request, status: 'expired' } : request
    ));
    
    toast({
      title: "Access Revoked",
      description: "Provider access has been revoked from the blockchain",
    });
  };
  
  const getStatusBadge = (status: AccessRequest['status'], verificationStatus: string) => {
    if (verificationStatus !== 'verified') {
      return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Unverified Provider</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><Check className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'denied':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Denied</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-slate-400 border-slate-400">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getTabCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      denied: 0
    };
    
    accessRequests.forEach(request => {
      if (request.status === 'pending') counts.pending++;
      else if (request.status === 'approved') counts.approved++;
      else counts.denied++;
    });
    
    return counts;
  };
  
  const tabCounts = getTabCounts();
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <CardTitle className="text-autheo-primary">Provider Access Requests</CardTitle>
        <CardDescription className="text-slate-300">
          Manage which healthcare providers can access your health records
        </CardDescription>
        
        <div className="relative flex mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search providers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={(value: 'pending' | 'approved' | 'denied') => setActiveTab(value)}>
          <TabsList className="bg-slate-700/30 mb-6">
            <TabsTrigger 
              value="pending" 
              className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
            >
              Pending
              {tabCounts.pending > 0 && <Badge className="ml-2 bg-yellow-600">{tabCounts.pending}</Badge>}
            </TabsTrigger>
            <TabsTrigger 
              value="approved" 
              className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
            >
              Approved
              {tabCounts.approved > 0 && <Badge className="ml-2 bg-green-600">{tabCounts.approved}</Badge>}
            </TabsTrigger>
            <TabsTrigger 
              value="denied" 
              className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
            >
              Denied/Expired
              {tabCounts.denied > 0 && <Badge className="ml-2 bg-slate-600">{tabCounts.denied}</Badge>}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-0 space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map(request => (
                <div key={request.id} className="bg-slate-700/30 border border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center mb-1">
                        <h3 className="font-medium text-slate-100">{request.provider.name}</h3>
                        {getStatusBadge(request.status, request.provider.verificationStatus)}
                      </div>
                      <div className="text-sm text-slate-300">
                        {request.provider.specialty && `${request.provider.specialty} • `}
                        {request.provider.organization && `${request.provider.organization} • `}
                        Requested on {request.requestDate}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-300 mb-2">
                    <span className="font-medium">Reason:</span> {request.reason}
                  </div>
                  
                  <div className="text-sm text-slate-300 mb-2">
                    <span className="font-medium">Duration:</span> {request.duration} days
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm font-medium text-slate-300">Data Requested:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {request.dataRequested.map((item, index) => (
                        <Badge key={index} variant="outline" className="bg-slate-700 border-slate-600">{item}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      onClick={() => handleApprove(request.id)} 
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      onClick={() => handleDeny(request.id)} 
                      variant="outline" 
                      className="border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4 mr-1" /> Deny
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                <h3 className="font-medium text-slate-300">No Pending Requests</h3>
                <p className="text-slate-400 text-sm">
                  When providers request access to your records, they will appear here
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="mt-0 space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map(request => (
                <div key={request.id} className="bg-slate-700/30 border border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center mb-1">
                        <h3 className="font-medium text-slate-100">{request.provider.name}</h3>
                        {getStatusBadge(request.status, request.provider.verificationStatus)}
                      </div>
                      <div className="text-sm text-slate-300">
                        {request.provider.specialty && `${request.provider.specialty} • `}
                        {request.provider.organization && `${request.provider.organization} • `}
                        Approved on {request.requestDate}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-300 mb-2">
                    <span className="font-medium">Access Expires:</span> {new Date(new Date(request.requestDate).getTime() + request.duration * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm font-medium text-slate-300">Data Access:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {request.dataRequested.map((item, index) => (
                        <Badge key={index} variant="outline" className="bg-slate-700 border-slate-600">{item}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleRevoke(request.id)} 
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    <Unlock className="h-4 w-4 mr-1" /> Revoke Access
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Shield className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                <h3 className="font-medium text-slate-300">No Approved Access</h3>
                <p className="text-slate-400 text-sm">
                  You haven't granted any providers access to your health records
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="denied" className="mt-0 space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map(request => (
                <div key={request.id} className="bg-slate-700/30 border border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center mb-1">
                        <h3 className="font-medium text-slate-100">{request.provider.name}</h3>
                        {getStatusBadge(request.status, request.provider.verificationStatus)}
                      </div>
                      <div className="text-sm text-slate-300">
                        {request.provider.specialty && `${request.provider.specialty} • `}
                        {request.provider.organization && `${request.provider.organization} • `}
                        Request from {request.requestDate}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-300 mb-2">
                    <span className="font-medium">Reason:</span> {request.reason}
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm font-medium text-slate-300">Data Requested:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {request.dataRequested.map((item, index) => (
                        <Badge key={index} variant="outline" className="bg-slate-700 border-slate-600">{item}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <X className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                <h3 className="font-medium text-slate-300">No Denied Requests</h3>
                <p className="text-slate-400 text-sm">
                  You haven't denied any access requests
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-slate-700/30 border-t border-slate-700 px-6 py-4 text-xs text-slate-400">
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-1.5 text-autheo-primary" /> 
          Access controls are cryptographically enforced and all actions are recorded on the blockchain
        </div>
      </CardFooter>
    </Card>
  );
};

export default PatientAccessManagement;
