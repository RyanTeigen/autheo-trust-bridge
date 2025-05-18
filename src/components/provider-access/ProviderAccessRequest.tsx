
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Shield, Search, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PatientSearch, { PatientInfo } from './request/PatientSearch';
import PatientInfoDisplay from './request/PatientInfoDisplay';
import AccessRequestForm from './request/AccessRequestForm';

interface AccessRequest {
  id: string;
  patientName: string;
  patientId: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  accessLevel: string;
  reason: string;
  expirationDate?: string;
}

interface ProviderAccessRequestProps {
  isEnhanced?: boolean;
}

const mockRequestHistory: AccessRequest[] = [
  { 
    id: 'R1', 
    patientName: 'John Doe', 
    patientId: 'P12345', 
    requestDate: '2025-05-15', 
    status: 'approved', 
    accessLevel: 'Full Access',
    reason: 'Primary care physician follow-up',
    expirationDate: '2025-06-15'
  },
  { 
    id: 'R2', 
    patientName: 'Jane Smith', 
    patientId: 'P23456', 
    requestDate: '2025-05-14', 
    status: 'pending', 
    accessLevel: 'Limited Access',
    reason: 'Specialist consultation'
  },
  { 
    id: 'R3', 
    patientName: 'Robert Johnson', 
    patientId: 'P34567', 
    requestDate: '2025-05-10', 
    status: 'rejected', 
    accessLevel: 'Full Access',
    reason: 'Lab results review'
  },
];

const ProviderAccessRequest: React.FC<ProviderAccessRequestProps> = ({ isEnhanced = false }) => {
  const [patientId, setPatientId] = useState('');
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [activeTab, setActiveTab] = useState('new');
  const [requestHistory, setRequestHistory] = useState<AccessRequest[]>(mockRequestHistory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRequestComplete = () => {
    // Reset form
    setPatientId('');
    setPatientInfo(null);
  };
  
  const handleCancelRequest = (requestId: string) => {
    setRequestHistory(prev => prev.filter(request => request.id !== requestId));
  };
  
  const handleRetryRequest = (requestId: string) => {
    // Simulate retrying a request
    setIsSubmitting(true);
    setTimeout(() => {
      setRequestHistory(prev => prev.map(request => 
        request.id === requestId ? { ...request, status: 'pending', requestDate: new Date().toISOString().split('T')[0] } : request
      ));
      setIsSubmitting(false);
    }, 1500);
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-900/20 text-amber-400 border-amber-700/30 flex items-center"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-700/30 flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-700/30 flex items-center"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-slate-700/40 text-slate-400 border-slate-600/50 flex items-center"><Clock className="h-3 w-3 mr-1" /> Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Use basic version if not enhanced
  if (!isEnhanced) {
    return (
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <CardTitle className="text-autheo-primary">Request Patient Access</CardTitle>
          <CardDescription className="text-slate-300">
            Request permission to view a patient's health records
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-4">
            {!patientInfo ? (
              <PatientSearch 
                patientId={patientId}
                setPatientId={setPatientId}
                setPatientInfo={setPatientInfo}
              />
            ) : (
              <>
                <PatientInfoDisplay patientInfo={patientInfo} />
                <AccessRequestForm 
                  patientInfo={patientInfo}
                  onRequestComplete={handleRequestComplete}
                />
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-slate-700/30 border-t border-slate-700 px-6 py-4 text-xs text-slate-400">
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-1.5 text-autheo-primary" /> 
            All access requests are cryptographically signed and recorded on the blockchain
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <CardTitle className="text-autheo-primary">Request Patient Access</CardTitle>
        <CardDescription className="text-slate-300">
          Request permission to view a patient's health records with detailed tracking and verification
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6 pt-6">
          <TabsList className="bg-slate-700/50 w-full grid grid-cols-3">
            <TabsTrigger value="new" className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">
              New Request
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">
              Pending
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">
              History
            </TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="p-6">
          <TabsContent value="new" className="mt-0 space-y-4">
            {!patientInfo ? (
              <PatientSearch 
                patientId={patientId}
                setPatientId={setPatientId}
                setPatientInfo={setPatientInfo}
              />
            ) : (
              <>
                <PatientInfoDisplay patientInfo={patientInfo} />
                <AccessRequestForm 
                  patientInfo={patientInfo}
                  onRequestComplete={handleRequestComplete}
                />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0">
            {requestHistory.filter(req => req.status === 'pending').length > 0 ? (
              <div className="space-y-4">
                {requestHistory
                  .filter(req => req.status === 'pending')
                  .map((request) => (
                    <div key={request.id} className="p-4 border border-slate-700 rounded-md bg-slate-700/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-slate-200">{request.patientName}</h3>
                          <p className="text-sm text-slate-400">Patient ID: {request.patientId}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Requested on {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(request.status)}
                          <Badge variant="outline" className="bg-slate-700/40 text-slate-300">
                            {request.accessLevel}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-slate-800/70 rounded text-sm text-slate-300 border border-slate-700/50">
                        <p><span className="text-autheo-primary">Reason:</span> {request.reason}</p>
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-slate-700"
                          onClick={() => handleCancelRequest(request.id)}
                        >
                          Cancel Request
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                No pending access requests
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            {requestHistory.filter(req => req.status !== 'pending').length > 0 ? (
              <div className="space-y-4">
                {requestHistory
                  .filter(req => req.status !== 'pending')
                  .map((request) => (
                    <div key={request.id} className="p-4 border border-slate-700 rounded-md bg-slate-700/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-slate-200">{request.patientName}</h3>
                          <p className="text-sm text-slate-400">Patient ID: {request.patientId}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Requested on {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(request.status)}
                          <Badge variant="outline" className="bg-slate-700/40 text-slate-300">
                            {request.accessLevel}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-slate-800/70 rounded text-sm text-slate-300 border border-slate-700/50">
                        <p><span className="text-autheo-primary">Reason:</span> {request.reason}</p>
                        {request.expirationDate && (
                          <p className="mt-1"><span className="text-autheo-primary">Expires:</span> {new Date(request.expirationDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        {request.status === 'approved' && (
                          <Button 
                            size="sm" 
                            className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
                          >
                            Access Records
                          </Button>
                        )}
                        {request.status === 'rejected' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-slate-700"
                            disabled={isSubmitting}
                            onClick={() => handleRetryRequest(request.id)}
                          >
                            {isSubmitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                            {isSubmitting ? 'Processing...' : 'Retry Request'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                No request history found
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="bg-slate-700/30 border-t border-slate-700 px-6 py-4 text-xs text-slate-400">
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-1.5 text-autheo-primary" /> 
          All access requests are cryptographically signed and recorded for auditability
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProviderAccessRequest;
