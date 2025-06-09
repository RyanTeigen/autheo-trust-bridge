
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  FileCheck, 
  FileX, 
  Shield, 
  Clock, 
  Key, 
  Search, 
  Filter, 
  CheckCircle2, 
  Database,
  Users,
  FileType,
  Calendar,
  Fingerprint
} from 'lucide-react';

interface BlockchainRecord {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  resource: string;
  hash: string;
  previousHash: string;
  verified: boolean;
}

// Sample blockchain audit records
const sampleRecords: BlockchainRecord[] = [
  {
    id: 'bk1',
    timestamp: new Date().toISOString(),
    action: 'Patient Record Access',
    user: 'Dr. Sarah Johnson',
    resource: 'Patient #12345',
    hash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    previousHash: '0x6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    verified: true
  },
  {
    id: 'bk2',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    action: 'Medication Record Update',
    user: 'Nurse Michael Rodriguez',
    resource: 'Patient #67890',
    hash: '0x3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278',
    previousHash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    verified: true
  },
  {
    id: 'bk3',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    action: 'Billing Information Access',
    user: 'Admin Emily Carter',
    resource: 'Patient #54321',
    hash: '0xef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    previousHash: '0x3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278',
    verified: true
  },
  {
    id: 'bk4',
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    action: 'System Configuration Change',
    user: 'Admin Jason Miller',
    resource: 'Security Settings',
    hash: '0x4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    previousHash: '0xef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    verified: false
  },
  {
    id: 'bk5',
    timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
    action: 'Data Export',
    user: 'Dr. Robert Lee',
    resource: 'Patient Records Batch',
    hash: '0x6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    previousHash: '0x4355a46b19d348dc2f57c046f8ef63d4538ebb936000f3c9ee954a27460dd865',
    verified: true
  }
];

// Statistics for the dashboard
const auditStats = {
  totalRecords: 5872,
  verifiedRecords: 5870,
  pendingVerification: 2,
  blockchainNodes: 7,
  lastConsensus: new Date(Date.now() - 15 * 60000).toISOString()
};

interface BlockchainAuditTrailProps {
  className?: string;
}

const BlockchainAuditTrail: React.FC<BlockchainAuditTrailProps> = ({ className }) => {
  const [records, setRecords] = useState<BlockchainRecord[]>(sampleRecords);
  const [isVerifying, setIsVerifying] = useState(false);
  const [filter, setFilter] = useState("all");
  
  // Simulate a blockchain verification process
  const verifyBlockchain = () => {
    setIsVerifying(true);
    
    // Simulate verification taking some time
    setTimeout(() => {
      // Update the unverified record to be verified
      const updatedRecords = records.map(record => 
        record.verified ? record : { ...record, verified: true }
      );
      
      setRecords(updatedRecords);
      setIsVerifying(false);
    }, 2500);
  };
  
  // Get filtered records based on the current filter
  const getFilteredRecords = () => {
    switch(filter) {
      case "unverified":
        return records.filter(record => !record.verified);
      case "verified":
        return records.filter(record => record.verified);
      case "access":
        return records.filter(record => record.action.includes("Access"));
      case "update":
        return records.filter(record => record.action.includes("Update"));
      default:
        return records;
    }
  };
  
  // Format hash for display (abbreviated)
  const formatHash = (hash: string) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };
  
  return (
    <Card className={`${className} bg-slate-800 border-slate-700 text-slate-100`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold flex items-center text-autheo-primary">
              <Database className="mr-2 h-5 w-5" />
              Blockchain Audit Trail
            </CardTitle>
            <CardDescription className="text-slate-300">
              Immutable, cryptographically secured audit records of all compliance events
            </CardDescription>
          </div>
          <div>
            <Button 
              onClick={verifyBlockchain} 
              disabled={isVerifying || !records.some(r => !r.verified)} 
              className="flex items-center gap-1 bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
            >
              <Key className={`h-4 w-4 ${isVerifying ? 'animate-pulse' : ''}`} />
              {isVerifying ? 'Verifying...' : 'Verify Blockchain'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-400">Total Records</p>
                    <p className="text-2xl font-bold text-slate-100">{auditStats.totalRecords}</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-autheo-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-400">Verified</p>
                    <p className="text-2xl font-bold text-slate-100">{auditStats.verifiedRecords}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-400">Pending Verification</p>
                    <p className="text-2xl font-bold text-slate-100">{auditStats.pendingVerification}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-400">Blockchain Nodes</p>
                    <p className="text-2xl font-bold text-slate-100">{auditStats.blockchainNodes}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Showing {getFilteredRecords().length} audit records</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select 
                className="text-sm border rounded p-1 bg-slate-700 border-slate-600 text-slate-100"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Records</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
                <option value="access">Access Events</option>
                <option value="update">Update Events</option>
              </select>
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden border-slate-600">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Block Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600">
                {getFilteredRecords().map((record) => (
                  <tr key={record.id} className={record.verified ? "bg-slate-800" : "bg-amber-900/20"}>
                    <td className="px-4 py-4">
                      {record.verified ? (
                        <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-500/30 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-600/20 text-amber-400 border-amber-500/30 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-100">{record.action}</td>
                    <td className="px-4 py-4 text-slate-200">{record.user}</td>
                    <td className="px-4 py-4 text-slate-200">{record.resource}</td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-300">{formatHash(record.hash)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-slate-600 pt-4 flex justify-between bg-slate-800">
        <span className="text-sm text-slate-400 flex items-center gap-1">
          <Fingerprint className="h-4 w-4" />
          Last consensus reached: {new Date(auditStats.lastConsensus).toLocaleString()}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600">
            <Calendar className="h-4 w-4 mr-1" />
            Export Logs
          </Button>
          <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600">
            <FileType className="h-4 w-4 mr-1" />
            Generate Report
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BlockchainAuditTrail;
