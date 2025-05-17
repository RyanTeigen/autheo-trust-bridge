
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ArrowUpDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Claim {
  id: string;
  serviceName: string;
  serviceDate: string;
  provider: string;
  amount: number;
  status: 'pending' | 'approved' | 'denied' | 'paid';
  insuranceProvider: string;
}

const ClaimsHistory: React.FC = () => {
  const { toast } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [userAuth, setUserAuth] = useState<{ id: string } | null>(null);
  
  // Get the user's authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserAuth({ id: session.user.id });
      }
    };
    
    checkAuth();
  }, []);
  
  useEffect(() => {
    // Load claims data - for now use sample data
    // In a real implementation, this would fetch from the database
    setLoading(true);
    
    setTimeout(() => {
      setClaims([
        {
          id: 'CL-123456',
          serviceName: 'Annual Physical',
          serviceDate: '2025-04-15',
          provider: 'Dr. Emily Chen',
          amount: 150.00,
          status: 'paid',
          insuranceProvider: 'Blue Cross Blue Shield'
        },
        {
          id: 'CL-123457',
          serviceName: 'Blood Tests',
          serviceDate: '2025-04-15',
          provider: 'LabCorp',
          amount: 200.00,
          status: 'approved',
          insuranceProvider: 'Blue Cross Blue Shield'
        },
        {
          id: 'CL-123458',
          serviceName: 'MRI - Lower Back',
          serviceDate: '2025-03-22',
          provider: 'Radiology Partners',
          amount: 1200.00,
          status: 'pending',
          insuranceProvider: 'Blue Cross Blue Shield'
        },
        {
          id: 'CL-123459',
          serviceName: 'Specialist Consultation',
          serviceDate: '2025-02-10',
          provider: 'Dr. James Wilson',
          amount: 250.00,
          status: 'denied',
          insuranceProvider: 'Blue Cross Blue Shield'
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);
  
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  const filteredAndSortedClaims = claims
    .filter(claim => 
      claim.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.serviceDate).getTime();
      const dateB = new Date(b.serviceDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500">Paid</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Pending</Badge>;
      case 'denied':
        return <Badge variant="outline" className="text-red-500 border-red-500">Denied</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-autheo-primary" />
          Claims History
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search claims..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            className="flex-shrink-0"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="h-12 w-12 mx-auto bg-slate-200 rounded-full mb-2"></div>
              <p className="text-sm text-slate-500">Loading claims history...</p>
            </div>
          </div>
        ) : filteredAndSortedClaims.length > 0 ? (
          <div className="space-y-3">
            {filteredAndSortedClaims.map(claim => (
              <div key={claim.id} className="border rounded-lg p-3 hover:bg-slate-50 transition-colors duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{claim.serviceName}</h4>
                    <p className="text-xs text-slate-500">{claim.provider}</p>
                  </div>
                  {getStatusBadge(claim.status)}
                </div>
                <div className="mt-2 text-sm">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Claim ID: {claim.id}</span>
                    <span className="text-slate-500">
                      {new Date(claim.serviceDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>{claim.insuranceProvider}</span>
                    <span className="font-medium">${claim.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm">No claims found</p>
            <p className="text-xs">Any insurance claims will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimsHistory;
