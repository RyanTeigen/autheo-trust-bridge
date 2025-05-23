
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, SendHorizontal, CheckCircle, XCircle, Loader2, QrCode, Lock } from 'lucide-react';

interface TransferRecordItem {
  id: string;
  title: string;
  type: string;
  provider: string;
  date: string;
  status: 'ready' | 'pending' | 'transferred' | 'error';
}

const DecentralizedTransfer: React.FC = () => {
  const { toast } = useToast();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  // Mock data for records that can be transferred
  const [transferableRecords, setTransferableRecords] = useState<TransferRecordItem[]>([
    {
      id: '1',
      title: 'Annual Physical Examination',
      type: 'note',
      provider: 'Dr. Emily Chen',
      date: '2025-04-10',
      status: 'ready'
    },
    {
      id: '2',
      title: 'Blood Test Results',
      type: 'lab',
      provider: 'City Hospital',
      date: '2025-04-05',
      status: 'ready'
    },
    {
      id: '3',
      title: 'Vaccination Record',
      type: 'immunization',
      provider: 'Community Health Clinic',
      date: '2025-03-22',
      status: 'ready'
    }
  ]);
  
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  
  const handleSelectRecord = (id: string) => {
    if (selectedRecords.includes(id)) {
      setSelectedRecords(selectedRecords.filter(recordId => recordId !== id));
    } else {
      setSelectedRecords([...selectedRecords, id]);
    }
  };
  
  const handleTransfer = async () => {
    if (selectedRecords.length === 0) {
      toast({
        title: "No records selected",
        description: "Please select at least one record to transfer",
        variant: "destructive",
      });
      return;
    }
    
    if (!recipientAddress.trim()) {
      toast({
        title: "Missing recipient",
        description: "Please enter a recipient address",
        variant: "destructive",
      });
      return;
    }
    
    setIsTransferring(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update record status
      const updatedRecords = transferableRecords.map(record => {
        if (selectedRecords.includes(record.id)) {
          return {
            ...record,
            status: 'transferred' as const
          };
        }
        return record;
      });
      
      setTransferableRecords(updatedRecords);
      setSelectedRecords([]);
      
      toast({
        title: "Transfer successful",
        description: `${selectedRecords.length} record(s) transferred to the recipient`,
      });
      
    } catch (error) {
      toast({
        title: "Transfer failed",
        description: "There was a problem transferring your records",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Ready</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
      case 'transferred':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Transferred</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-autheo-primary flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Decentralized Health Transfer
            </CardTitle>
            <CardDescription>
              Securely transfer your health records to other providers or institutions
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-autheo-primary/10 text-autheo-primary border-autheo-primary/30">
            Blockchain Secured
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recipient Section */}
        <div>
          <label className="text-sm font-medium mb-2 block">Recipient Address</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input 
                placeholder="Enter recipient address or ID" 
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="pl-9"
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
          
          {showQR && (
            <div className="mt-4 border rounded-md p-4 bg-slate-50 flex flex-col items-center">
              <div className="bg-white p-2 border rounded-md">
                {/* This is a placeholder for a QR code */}
                <div className="h-40 w-40 bg-slate-200 flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-slate-400" />
                </div>
              </div>
              <p className="text-xs text-center mt-2 text-muted-foreground">
                Scan this code with the recipient's device
              </p>
            </div>
          )}
        </div>
        
        {/* Records Selection */}
        <div>
          <h3 className="text-sm font-medium mb-3">Select Records to Transfer</h3>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {transferableRecords.map(record => (
              <div 
                key={record.id}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedRecords.includes(record.id) ? 'bg-autheo-primary/10 border-autheo-primary/30' : 'hover:bg-slate-50'
                }`}
                onClick={() => record.status === 'ready' && handleSelectRecord(record.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{record.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Provider: {record.provider} • Date: {new Date(record.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(record.status)}
                    
                    {selectedRecords.includes(record.id) && (
                      <CheckCircle className="h-5 w-5 text-autheo-primary" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-muted-foreground">
          {selectedRecords.length} record(s) selected
        </div>
        
        <Button 
          onClick={handleTransfer} 
          disabled={isTransferring || selectedRecords.length === 0 || !recipientAddress.trim()}
          className="bg-autheo-primary hover:bg-autheo-primary/90"
        >
          {isTransferring ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Transferring...
            </>
          ) : (
            <>
              <SendHorizontal className="h-4 w-4 mr-2" />
              Transfer Records
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DecentralizedTransfer;
