
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, Calendar, User, FileText, Plus, Info, AlertTriangle, Check, X, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ConsentGrant {
  id: string;
  recipientName: string;
  recipientType: 'provider' | 'organization' | 'family' | 'research';
  recordTypes: string[];
  grantedOn: string;
  expiryDate: string;
  accessLevel: 'full' | 'limited' | 'emergency';
  conditions?: string[];
  status: 'active' | 'revoked' | 'expired';
}

interface RecordType {
  id: string;
  name: string;
  description: string;
  sensitive: boolean;
  category: string;
}

const mockRecordTypes: RecordType[] = [
  { id: '1', name: 'Medications', description: 'Current and past medications', sensitive: false, category: 'treatment' },
  { id: '2', name: 'Lab Results', description: 'Laboratory test results', sensitive: false, category: 'diagnostics' },
  { id: '3', name: 'Diagnoses', description: 'Medical conditions and diagnoses', sensitive: false, category: 'condition' },
  { id: '4', name: 'Allergies', description: 'Known allergies and reactions', sensitive: false, category: 'condition' },
  { id: '5', name: 'Immunizations', description: 'Vaccination records', sensitive: false, category: 'preventive' },
  { id: '6', name: 'Vital Signs', description: 'Blood pressure, heart rate, etc.', sensitive: false, category: 'monitoring' },
  { id: '7', name: 'Mental Health', description: 'Psychiatric evaluations and notes', sensitive: true, category: 'condition' },
  { id: '8', name: 'Genetic Tests', description: 'Genetic testing results', sensitive: true, category: 'diagnostics' },
  { id: '9', name: 'Reproductive Health', description: 'Reproductive and sexual health records', sensitive: true, category: 'condition' },
  { id: '10', name: 'Substance Use', description: 'Substance use disorder treatment', sensitive: true, category: 'treatment' },
  { id: '11', name: 'Provider Notes', description: 'Clinical notes from providers', sensitive: false, category: 'treatment' }
];

const mockConsentGrants: ConsentGrant[] = [
  {
    id: '1',
    recipientName: 'Dr. Emily Chen',
    recipientType: 'provider',
    recordTypes: ['Medications', 'Lab Results', 'Diagnoses', 'Allergies', 'Vital Signs', 'Provider Notes'],
    grantedOn: '2024-12-15',
    expiryDate: '2025-12-15',
    accessLevel: 'full',
    status: 'active'
  },
  {
    id: '2',
    recipientName: 'Central Hospital',
    recipientType: 'organization',
    recordTypes: ['Medications', 'Allergies', 'Immunizations'],
    grantedOn: '2024-11-10',
    expiryDate: '2025-05-10',
    accessLevel: 'limited',
    conditions: ['Emergency use only', 'Notify patient within 24 hours of access'],
    status: 'active'
  },
  {
    id: '3',
    recipientName: 'Maria Johnson (Spouse)',
    recipientType: 'family',
    recordTypes: ['Medications', 'Allergies', 'Diagnoses'],
    grantedOn: '2024-10-05',
    expiryDate: '2025-10-05',
    accessLevel: 'limited',
    status: 'active'
  },
  {
    id: '4',
    recipientName: 'HealthCare Research Institute',
    recipientType: 'research',
    recordTypes: ['Lab Results', 'Diagnoses', 'Vital Signs'],
    grantedOn: '2024-09-20',
    expiryDate: '2025-03-20',
    accessLevel: 'limited',
    conditions: ['De-identified data only', 'Research purpose: Cardiovascular Health Study'],
    status: 'active'
  },
  {
    id: '5',
    recipientName: 'Dr. Robert Taylor',
    recipientType: 'provider',
    recordTypes: ['Mental Health'],
    grantedOn: '2024-08-15',
    expiryDate: '2024-11-15',
    accessLevel: 'full',
    status: 'expired'
  }
];

const AdvancedConsentManagement: React.FC = () => {
  const { toast } = useToast();
  const [consents, setConsents] = useState<ConsentGrant[]>(mockConsentGrants);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [editingConsent, setEditingConsent] = useState<ConsentGrant | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  
  const handleManageConsent = (consent: ConsentGrant) => {
    setEditingConsent(consent);
    setIsManageDialogOpen(true);
  };
  
  const handleRevokeConsent = (id: string) => {
    setConsents(
      consents.map(consent =>
        consent.id === id ? { ...consent, status: 'revoked' } : consent
      )
    );
    setIsManageDialogOpen(false);
    
    toast({
      title: "Consent Revoked",
      description: "Access has been revoked successfully.",
    });
  };
  
  const handleExtendConsent = (id: string) => {
    // In a real app, this would show a date picker to select a new expiry date
    const newExpiryDate = new Date();
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
    
    setConsents(
      consents.map(consent =>
        consent.id === id ? { 
          ...consent, 
          expiryDate: newExpiryDate.toISOString().split('T')[0],
          status: 'active'
        } : consent
      )
    );
    
    setIsManageDialogOpen(false);
    
    toast({
      title: "Consent Extended",
      description: "Access period has been extended successfully.",
    });
  };
  
  const filteredConsents = consents.filter(consent => {
    if (activeTab === 'active') return consent.status === 'active';
    if (activeTab === 'revoked') return consent.status === 'revoked';
    if (activeTab === 'expired') return consent.status === 'expired';
    return true; // 'all' tab
  });
  
  const getStatusBadge = (status: ConsentGrant['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600/20 text-green-500 border-green-500/30">Active</Badge>;
      case 'revoked':
        return <Badge className="bg-red-600/20 text-red-500 border-red-500/30">Revoked</Badge>;
      case 'expired':
        return <Badge className="bg-amber-600/20 text-amber-500 border-amber-500/30">Expired</Badge>;
    }
  };
  
  const getRecipientTypeIcon = (type: ConsentGrant['recipientType']) => {
    switch (type) {
      case 'provider':
        return <User className="h-4 w-4 text-blue-400" />;
      case 'organization':
        return <FileText className="h-4 w-4 text-purple-400" />;
      case 'family':
        return <Heart className="h-4 w-4 text-pink-400" />;
      case 'research':
        return <Microscope className="h-4 w-4 text-green-400" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-autheo-primary flex items-center">
                <Shield className="mr-2 h-5 w-5" /> Consent Management
              </CardTitle>
              <CardDescription className="text-slate-300">
                Control who can access your health information and under what conditions
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
            >
              <Plus className="mr-1 h-4 w-4" /> Grant Access
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-5">
          <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-slate-900/50 border-slate-700 mb-6">
              <TabsTrigger value="active" className="data-[state=active]:bg-slate-800 data-[state=active]:text-autheo-primary">
                Active
              </TabsTrigger>
              <TabsTrigger value="revoked" className="data-[state=active]:bg-slate-800 data-[state=active]:text-autheo-primary">
                Revoked
              </TabsTrigger>
              <TabsTrigger value="expired" className="data-[state=active]:bg-slate-800 data-[state=active]:text-autheo-primary">
                Expired
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-800 data-[state=active]:text-autheo-primary">
                All
              </TabsTrigger>
            </TabsList>
            
            {filteredConsents.length > 0 ? (
              <div className="space-y-4">
                {filteredConsents.map((consent) => (
                  <Card key={consent.id} className="bg-slate-900/50 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center gap-1">
                              {getRecipientTypeIcon(consent.recipientType)}
                              <Badge variant="outline" className="bg-slate-800/50 border-slate-600">
                                {consent.recipientType.charAt(0).toUpperCase() + consent.recipientType.slice(1)}
                              </Badge>
                            </span>
                            {getStatusBadge(consent.status)}
                          </div>
                          
                          <h3 className="text-lg font-medium text-autheo-primary mb-1">
                            {consent.recipientName}
                          </h3>
                          
                          <div className="flex items-center text-xs text-slate-400 space-x-3 mb-2">
                            <span className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" /> Granted: {new Date(consent.grantedOn).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1" /> Expires: {new Date(consent.expiryDate).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-xs bg-slate-800/50 border-slate-600">
                              {consent.accessLevel.charAt(0).toUpperCase() + consent.accessLevel.slice(1)} Access
                            </Badge>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-slate-700 hover:bg-slate-800 text-slate-300"
                          onClick={() => handleManageConsent(consent)}
                        >
                          Manage
                        </Button>
                      </div>
                      
                      <div>
                        <p className="text-xs text-slate-400 mb-1.5">Records shared:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {consent.recordTypes.map((record, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {record}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {consent.conditions && consent.conditions.length > 0 && (
                        <div className="mt-3 p-2 bg-slate-800/70 rounded-md">
                          <p className="text-xs text-slate-300 flex items-center mb-1">
                            <Info className="h-3 w-3 mr-1.5 text-autheo-primary" /> Access Conditions:
                          </p>
                          <ul className="text-xs text-slate-400 list-disc pl-5 space-y-0.5">
                            {consent.conditions.map((condition, idx) => (
                              <li key={idx}>{condition}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-900/30 rounded-md">
                <Shield className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-300">No {activeTab} consent records found.</p>
                {activeTab !== 'active' && (
                  <Button 
                    variant="link" 
                    className="text-autheo-primary hover:text-autheo-primary/80 p-0 mt-2"
                    onClick={() => setActiveTab('active')}
                  >
                    View active consents
                  </Button>
                )}
              </div>
            )}
          </Tabs>
        </CardContent>
        
        <CardFooter className="bg-slate-700/20 border-t border-slate-700 flex justify-between items-center">
          <p className="text-xs text-slate-400 flex items-center">
            <Info className="h-3.5 w-3.5 mr-1.5" /> 
            All consent activities are cryptographically recorded for accountability
          </p>
          <Button variant="outline" size="sm" className="text-autheo-primary border-slate-700 hover:bg-slate-800">
            View Access Logs
          </Button>
        </CardFooter>
      </Card>
      
      {/* Manage Consent Dialog */}
      {editingConsent && (
        <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
          <DialogContent className="bg-slate-900 text-slate-100 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-autheo-primary">Manage Consent</DialogTitle>
              <DialogDescription className="text-slate-400">
                Edit or revoke access rights for {editingConsent.recipientName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 font-medium">{editingConsent.recipientName}</p>
                  <p className="text-sm text-slate-400">{editingConsent.recipientType.charAt(0).toUpperCase() + editingConsent.recipientType.slice(1)}</p>
                </div>
                {getStatusBadge(editingConsent.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Granted On</p>
                  <p className="text-slate-300">{new Date(editingConsent.grantedOn).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Expires On</p>
                  <p className="text-slate-300">{new Date(editingConsent.expiryDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Access Level</p>
                  <p className="text-slate-300">{editingConsent.accessLevel.charAt(0).toUpperCase() + editingConsent.accessLevel.slice(1)}</p>
                </div>
              </div>
              
              <div className="border-t border-slate-700 pt-4">
                <p className="text-sm text-slate-300 mb-2">Shared Record Types:</p>
                <div className="flex flex-wrap gap-1.5">
                  {editingConsent.recordTypes.map((record, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {record}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {editingConsent.conditions && editingConsent.conditions.length > 0 && (
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-sm text-slate-300 mb-2">Access Conditions:</p>
                  <ul className="text-sm text-slate-400 list-disc pl-5 space-y-1">
                    {editingConsent.conditions.map((condition, idx) => (
                      <li key={idx}>{condition}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {editingConsent.status === 'expired' && (
                <div className="bg-amber-900/20 border border-amber-700/20 p-3 rounded-md">
                  <p className="text-sm flex items-center text-amber-400">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    This consent has expired. You can extend it or leave it expired.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex gap-2">
              {editingConsent.status === 'active' && (
                <Button
                  variant="destructive"
                  onClick={() => handleRevokeConsent(editingConsent.id)}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-1" /> Revoke Access
                </Button>
              )}
              
              {editingConsent.status === 'expired' && (
                <Button
                  className="w-full sm:w-auto bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
                  onClick={() => handleExtendConsent(editingConsent.id)}
                >
                  <Clock className="h-4 w-4 mr-1" /> Extend Access
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => setIsManageDialogOpen(false)}
                className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              
              {editingConsent.status === 'active' && (
                <Button
                  className="w-full sm:w-auto bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
                >
                  <Edit className="h-4 w-4 mr-1" /> Update Settings
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Import the necessary icons
const Heart = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const Microscope = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 18h8" />
    <path d="M3 22h18" />
    <path d="M14 22a7 7 0 1 0 0-14h-1" />
    <path d="M9 14h.01" />
    <path d="M9 12a2 2 0 0 1 2-2c.96 0 1.84.49 2.28 1.3" />
    <path d="M6 6c.32.72 1.3 1.3 2.4 1.3.53 0 1.04-.11 1.4-.3.79-.4 1.4-1.08 1.4-2 0-1.11-.9-2-2-2a1.75 1.75 0 0 0-1.51.85C7.43 4.54 7 5.5 7 6.5" />
  </svg>
);

export default AdvancedConsentManagement;
