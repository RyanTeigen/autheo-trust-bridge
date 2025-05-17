
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Shield, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const DistributedStorage = () => {
  // In a real implementation, this would fetch actual storage stats
  const storageNodes = [
    { id: 'node1', name: 'Primary Node', status: 'active', health: 98, location: 'US East' },
    { id: 'node2', name: 'Secondary Node', status: 'active', health: 95, location: 'EU West' },
    { id: 'node3', name: 'Backup Node', status: 'active', health: 99, location: 'Asia Pacific' },
    { id: 'node4', name: 'Recovery Node', status: 'standby', health: 100, location: 'US West' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5 text-primary" /> 
          Distributed Storage
        </CardTitle>
        <CardDescription>
          Your health data is securely distributed across multiple encrypted nodes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {storageNodes.map((node) => (
            <div key={node.id} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${node.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <span className="font-medium text-sm">{node.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{node.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={node.health} className="h-1.5" />
                <span className="text-xs font-medium">{node.health}%</span>
              </div>
            </div>
          ))}
          <div className="rounded-md bg-muted p-2 mt-4">
            <p className="text-xs text-muted-foreground">Data is encrypted using AES-256 and split across multiple nodes. Only you control the encryption keys.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DistributedStorage;
