import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Download, Eye, Clock, Shield, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ConsentRecord {
  id: string;
  user_did: string;
  requester: string;
  data_types: string[];
  duration: string | null;
  timestamp: string;
  revoked: boolean;
  revoked_at?: string | null;
  tx_id?: string | null;
  created_at: string;
}

interface ConsentRevocation {
  id: string;
  consent_id: string;
  revoked_by: string;
  reason?: string;
  revoked_at: string;
  revocation_hash: string;
  blockchain_tx_hash?: string;
  anchored: boolean;
}

const ProviderConsentAudit: React.FC = () => {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [revocations, setRevocations] = useState<ConsentRevocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const { toast } = useToast();

  useEffect(() => {
    fetchConsentData();
  }, []);

  const fetchConsentData = async () => {
    try {
      setLoading(true);

      // Fetch all consent records
      const { data: consentData, error: consentError } = await supabase
        .from('consents')
        .select('*')
        .order('created_at', { ascending: false });

      if (consentError) {
        throw new Error(`Failed to fetch consents: ${consentError.message}`);
      }

      // Fetch revocation records
      const { data: revocationData, error: revocationError } = await supabase
        .from('consent_revocations')
        .select('*')
        .order('revoked_at', { ascending: false });

      if (revocationError) {
        console.warn('Failed to fetch revocations:', revocationError.message);
      }

      setConsents((consentData || []).map(consent => ({
        ...consent,
        duration: consent.duration ? String(consent.duration) : null
      })));
      setRevocations(revocationData || []);
    } catch (error) {
      console.error('Error fetching consent data:', error);
      toast({
        title: "Error",
        description: "Failed to load consent audit data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredConsents = () => {
    const now = new Date();
    
    switch (activeTab) {
      case 'active':
        return consents.filter(consent => 
          !consent.revoked && 
          (!consent.duration || new Date(consent.timestamp) < now)
        );
      case 'revoked':
        return consents.filter(consent => consent.revoked);
      case 'expired':
        return consents.filter(consent => 
          !consent.revoked && 
          consent.duration && 
          isConsentExpired(consent)
        );
      default:
        return consents;
    }
  };

  const isConsentExpired = (consent: ConsentRecord): boolean => {
    if (!consent.duration) return false;
    
    const createdDate = new Date(consent.timestamp);
    const durationMatch = consent.duration.match(/(\d+)\s*(days?|hours?|minutes?)/i);
    
    if (!durationMatch) return false;
    
    const [, number, unit] = durationMatch;
    const amount = parseInt(number);
    
    switch (unit.toLowerCase()) {
      case 'days':
      case 'day':
        createdDate.setDate(createdDate.getDate() + amount);
        break;
      case 'hours':
      case 'hour':
        createdDate.setHours(createdDate.getHours() + amount);
        break;
      case 'minutes':
      case 'minute':
        createdDate.setMinutes(createdDate.getMinutes() + amount);
        break;
    }
    
    return createdDate < new Date();
  };

  const getStatusBadge = (consent: ConsentRecord) => {
    if (consent.revoked) {
      return <Badge variant="destructive">Revoked</Badge>;
    }
    
    if (isConsentExpired(consent)) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-600">Active</Badge>;
  };

  const exportConsentLedger = async (format: 'csv' | 'pdf') => {
    try {
      const filteredConsents = getFilteredConsents();
      
      if (format === 'csv') {
        const csvContent = [
          'ID,Patient DID,Requester,Data Types,Duration,Created,Status,Revoked At,Blockchain TX',
          ...filteredConsents.map(consent => [
            consent.id,
            consent.user_did,
            consent.requester,
            consent.data_types.join(';'),
            consent.duration || 'Indefinite',
            consent.timestamp,
            consent.revoked ? 'Revoked' : (isConsentExpired(consent) ? 'Expired' : 'Active'),
            consent.revoked_at || '',
            consent.tx_id || ''
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consent-ledger-${format}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Complete",
          description: `Consent ledger exported as ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error('Error exporting consent ledger:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export consent ledger",
        variant: "destructive",
      });
    }
  };

  const getConsentStats = () => {
    const total = consents.length;
    const active = consents.filter(c => !c.revoked && !isConsentExpired(c)).length;
    const revoked = consents.filter(c => c.revoked).length;
    const expired = consents.filter(c => !c.revoked && isConsentExpired(c)).length;

    return { total, active, revoked, expired };
  };

  const stats = getConsentStats();
  const filteredConsents = getFilteredConsents();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Provider Consent Audit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-slate-400">Loading consent audit data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Provider Consent Audit Dashboard
          </CardTitle>
          <CardDescription>
            Monitor and audit patient consent records with blockchain verification
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Consents</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active</p>
                <p className="text-2xl font-bold text-green-400">{stats.active}</p>
              </div>
              <Shield className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Revoked</p>
                <p className="text-2xl font-bold text-red-400">{stats.revoked}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Expired</p>
                <p className="text-2xl font-bold text-orange-400">{stats.expired}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => exportConsentLedger('csv')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => exportConsentLedger('pdf')}
              className="flex items-center gap-2"
              disabled
            >
              <Download className="h-4 w-4" />
              Export PDF (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Consent Records</CardTitle>
          <CardDescription>
            View and manage patient consent records by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
              <TabsTrigger value="revoked">Revoked ({stats.revoked})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({stats.expired})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <ScrollArea className="h-96">
                {filteredConsents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No consent records found for this category</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredConsents.map((consent) => (
                      <Card key={consent.id} className="border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{consent.id.slice(0, 8)}</Badge>
                                {getStatusBadge(consent)}
                                {consent.tx_id && (
                                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                                    Anchored
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-slate-400">Patient DID:</span>
                                  <span className="ml-2">{consent.user_did}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Requester:</span>
                                  <span className="ml-2">{consent.requester}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Data Types:</span>
                                  <span className="ml-2">{consent.data_types.join(', ')}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Duration:</span>
                                  <span className="ml-2">{consent.duration || 'Indefinite'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Created:</span>
                                  <span className="ml-2">{format(new Date(consent.timestamp), 'PPp')}</span>
                                </div>
                                {consent.revoked_at && (
                                  <div>
                                    <span className="text-slate-400">Revoked:</span>
                                    <span className="ml-2 text-red-400">{format(new Date(consent.revoked_at), 'PPp')}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderConsentAudit;