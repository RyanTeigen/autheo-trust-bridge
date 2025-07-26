import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Send, Shield, CheckCircle, AlertTriangle, Clock, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

interface DataTransferRequest {
  id: string;
  destination_country: string;
  destination_org: string;
  data_type: string;
  legal_basis: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_transit' | 'completed';
  created_at: string;
  adequacy_decision: boolean;
  safeguards_applied: string[];
}

interface Country {
  code: string;
  name: string;
  adequacy_decision: boolean;
  privacy_framework: string;
  transfer_mechanism: string[];
}

const CrossBorderDataExchange: React.FC = () => {
  const [transferRequests, setTransferRequests] = useState<DataTransferRequest[]>([
    {
      id: '1',
      destination_country: 'CA',
      destination_org: 'Toronto General Hospital',
      data_type: 'Patient Clinical Records',
      legal_basis: 'Treatment',
      status: 'completed',
      created_at: '2024-01-20',
      adequacy_decision: true,
      safeguards_applied: ['Encryption', 'Anonymization', 'Audit Trail']
    },
    {
      id: '2',
      destination_country: 'BR',
      destination_org: 'Hospital Sírio-Libanês',
      data_type: 'Medical Imaging',
      legal_basis: 'Research',
      status: 'pending',
      created_at: '2024-01-22',
      adequacy_decision: false,
      safeguards_applied: ['Standard Contractual Clauses', 'Encryption']
    }
  ]);

  const [newTransfer, setNewTransfer] = useState({
    destination_country: '',
    destination_org: '',
    data_type: '',
    legal_basis: '',
    justification: ''
  });

  const countries: Country[] = [
    {
      code: 'CA',
      name: 'Canada',
      adequacy_decision: true,
      privacy_framework: 'PIPEDA',
      transfer_mechanism: ['Adequacy Decision', 'Standard Contractual Clauses']
    },
    {
      code: 'UK',
      name: 'United Kingdom',
      adequacy_decision: true,
      privacy_framework: 'UK GDPR',
      transfer_mechanism: ['Adequacy Decision']
    },
    {
      code: 'US',
      name: 'United States',
      adequacy_decision: false,
      privacy_framework: 'State-level laws',
      transfer_mechanism: ['Standard Contractual Clauses', 'Binding Corporate Rules']
    },
    {
      code: 'BR',
      name: 'Brazil',
      adequacy_decision: false,
      privacy_framework: 'LGPD',
      transfer_mechanism: ['Standard Contractual Clauses', 'Adequate Level of Protection']
    },
    {
      code: 'SG',
      name: 'Singapore',
      adequacy_decision: false,
      privacy_framework: 'PDPA',
      transfer_mechanism: ['Standard Contractual Clauses', 'Binding Corporate Rules']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'approved':
      case 'in_transit':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleSubmitTransfer = () => {
    if (!newTransfer.destination_country || !newTransfer.destination_org || !newTransfer.data_type || !newTransfer.legal_basis) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedCountry = countries.find(c => c.code === newTransfer.destination_country);
    
    const request: DataTransferRequest = {
      id: Date.now().toString(),
      destination_country: newTransfer.destination_country,
      destination_org: newTransfer.destination_org,
      data_type: newTransfer.data_type,
      legal_basis: newTransfer.legal_basis,
      status: 'pending',
      created_at: new Date().toISOString().split('T')[0],
      adequacy_decision: selectedCountry?.adequacy_decision || false,
      safeguards_applied: selectedCountry?.adequacy_decision ? ['Adequacy Decision'] : ['Standard Contractual Clauses', 'Encryption']
    };

    setTransferRequests([request, ...transferRequests]);
    setNewTransfer({
      destination_country: '',
      destination_org: '',
      data_type: '',
      legal_basis: '',
      justification: ''
    });
    
    toast.success('Cross-border data transfer request submitted');
  };

  const selectedCountry = countries.find(c => c.code === newTransfer.destination_country);

  return (
    <div className="space-y-6">
      {/* New Transfer Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            New Cross-Border Data Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination Country</label>
              <Select value={newTransfer.destination_country} onValueChange={(value) => 
                setNewTransfer({...newTransfer, destination_country: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        {country.name}
                        {country.adequacy_decision && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Adequate
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Destination Organization</label>
              <Input
                placeholder="Hospital, clinic, or organization name"
                value={newTransfer.destination_org}
                onChange={(e) => setNewTransfer({...newTransfer, destination_org: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Type</label>
              <Select value={newTransfer.data_type} onValueChange={(value) => 
                setNewTransfer({...newTransfer, data_type: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinical_records">Clinical Records</SelectItem>
                  <SelectItem value="medical_imaging">Medical Imaging</SelectItem>
                  <SelectItem value="lab_results">Laboratory Results</SelectItem>
                  <SelectItem value="genetic_data">Genetic Data</SelectItem>
                  <SelectItem value="research_data">Research Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Legal Basis</label>
              <Select value={newTransfer.legal_basis} onValueChange={(value) => 
                setNewTransfer({...newTransfer, legal_basis: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select legal basis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="research">Medical Research</SelectItem>
                  <SelectItem value="public_health">Public Health</SelectItem>
                  <SelectItem value="emergency">Emergency Care</SelectItem>
                  <SelectItem value="consent">Explicit Consent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Justification</label>
            <Textarea
              placeholder="Provide detailed justification for the cross-border transfer..."
              value={newTransfer.justification}
              onChange={(e) => setNewTransfer({...newTransfer, justification: e.target.value})}
            />
          </div>

          {selectedCountry && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Transfer Requirements for {selectedCountry.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Privacy Framework:</span>
                    <span>{selectedCountry.privacy_framework}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Adequacy Decision:</span>
                    {selectedCountry.adequacy_decision ? (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        No - Additional safeguards required
                      </Badge>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Available Transfer Mechanisms:</span>
                    <div className="flex gap-1 mt-1">
                      {selectedCountry.transfer_mechanism.map((mechanism, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {mechanism}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={handleSubmitTransfer} className="w-full">
            Submit Transfer Request
          </Button>
        </CardContent>
      </Card>

      {/* Transfer History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Transfer History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transferRequests.map((request) => {
              const country = countries.find(c => c.code === request.destination_country);
              
              return (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{request.destination_org}</h4>
                        <Badge variant="outline" className="text-xs">
                          {country?.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.data_type} • {request.legal_basis}
                      </p>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium">Adequacy Decision:</span>
                      {request.adequacy_decision ? (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          No
                        </Badge>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-medium">Safeguards Applied:</span>
                      <div className="flex gap-1 mt-1">
                        {request.safeguards_applied.map((safeguard, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {safeguard}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                      <Button variant="ghost" size="sm">
                        <FileCheck className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossBorderDataExchange;