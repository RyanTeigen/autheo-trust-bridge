import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Shield, Info, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { verifyConsentSignature } from '@/utils/did';

interface ConsentRecord {
  id: string;
  medical_record_id: string;
  grantee_id: string;
  patient_id: string;
  signed_consent: string | null;
  status: string;
  responded_at: string | null;
  grantee_name?: string;
  record_type?: string;
}

const ConsentHashDisplay: React.FC = () => {
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConsentRecords();
  }, []);

  const fetchConsentRecords = async () => {
    try {
      setLoading(true);

      // Fetch sharing permissions with consent signatures
      const { data, error } = await supabase
        .from('sharing_permissions')
        .select(`
          id,
          medical_record_id,
          grantee_id,
          patient_id,
          signed_consent,
          status,
          responded_at,
          medical_records!inner(
            record_type
          )
        `)
        .not('signed_consent', 'is', null)
        .order('responded_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get grantee information
      const recordsWithGranteeInfo = await Promise.all(
        (data || []).map(async (record) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', record.grantee_id)
            .single();

          return {
            ...record,
            grantee_name: profile ? 
              `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'Unknown' :
              'Unknown User',
            record_type: (record.medical_records as any)?.record_type || 'Medical Record'
          } as ConsentRecord;
        })
      );

      setConsentRecords(recordsWithGranteeInfo);

    } catch (error) {
      console.error('Error fetching consent records:', error);
      toast({
        title: "Error",
        description: "Failed to load consent records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderConsentDetails = (consent: ConsentRecord) => {
    if (!consent.signed_consent) return null;

    const verification = verifyConsentSignature(consent.signed_consent);
    
    return (
      <div className="space-y-3 p-4 max-w-md">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-400" />
          <span className="font-medium text-slate-200">Consent Verification</span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Valid:</span>
            <div className="flex items-center gap-1">
              {verification.isValid ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">Yes</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 text-red-400" />
                  <span className="text-red-400">No</span>
                </>
              )}
            </div>
          </div>
          
          {verification.isValid && verification.timestamp && (
            <div className="flex justify-between">
              <span className="text-slate-400">Signed:</span>
              <span className="text-slate-300">
                {new Date(verification.timestamp).toLocaleString()}
              </span>
            </div>
          )}
          
          <div className="mt-3 p-2 bg-slate-700 rounded text-xs">
            <div className="text-slate-400 mb-1">Consent Hash:</div>
            <div className="font-mono text-slate-300 break-all">
              {consent.signed_consent.slice(0, 40)}...
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <FileText className="h-5 w-5 text-autheo-primary" />
            Loading Consent Records...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <FileText className="h-5 w-5 text-autheo-primary" />
          DID Consent Records
        </CardTitle>
        <CardDescription>
          Cryptographically signed consent hashes for data sharing approvals
        </CardDescription>
      </CardHeader>
      <CardContent>
        {consentRecords.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No signed consent records found</p>
            <p className="text-sm mt-2">Consent signatures will appear here when patients approve sharing requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Record Type</TableHead>
                  <TableHead className="text-slate-300">Granted To</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Consent Hash</TableHead>
                  <TableHead className="text-slate-300">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consentRecords.map((record) => (
                  <TableRow key={record.id} className="border-slate-700 hover:bg-slate-750">
                    <TableCell className="text-slate-200 font-medium">
                      {record.record_type}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {record.grantee_name}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={record.status === 'approved' ? 'default' : 'secondary'}
                        className={
                          record.status === 'approved' 
                            ? 'bg-green-900/20 text-green-400 border-green-800'
                            : 'bg-slate-600/20 text-slate-400 border-slate-600'
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">
                          {record.signed_consent?.slice(0, 12)}...
                        </span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Info className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="bg-slate-800 border-slate-600">
                            {renderConsentDetails(record)}
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {record.responded_at ? 
                        new Date(record.responded_at).toLocaleString() : 
                        'N/A'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsentHashDisplay;