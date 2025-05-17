
import React from 'react';
import { Calendar, Clock, FileBadge, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SharedRecord } from './types';

interface SharedRecordCardProps {
  record: SharedRecord;
  onRevokeAccess: (id: string) => void;
}

const SharedRecordCard: React.FC<SharedRecordCardProps> = ({ record, onRevokeAccess }) => {
  // Helper function to get status badge styling
  const getStatusBadge = (status: SharedRecord['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">Pending</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Expired</Badge>;
    }
  };
  
  // Helper function to get access level badge styling
  const getAccessLevelBadge = (level: SharedRecord['accessLevel']) => {
    switch (level) {
      case 'full':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Full Access</Badge>;
      case 'limited':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">Limited Access</Badge>;
      case 'read-only':
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">Read Only</Badge>;
    }
  };
  
  // Helper function to get recipient type badge styling
  const getRecipientTypeBadge = (type: SharedRecord['recipientType']) => {
    switch (type) {
      case 'provider':
        return <Badge variant="outline" className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">Healthcare Provider</Badge>;
      case 'organization':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">Organization</Badge>;
      case 'caregiver':
        return <Badge variant="outline" className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">Caregiver</Badge>;
    }
  };

  return (
    <Card className="mb-4 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <h3 className="text-lg font-medium">{record.recipientName}</h3>
              {getStatusBadge(record.status)}
              {getRecipientTypeBadge(record.recipientType)}
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Shared: {new Date(record.sharedDate).toLocaleDateString()}</span>
              </div>
              
              {record.expiryDate && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Expires: {new Date(record.expiryDate).toLocaleDateString()}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <FileBadge className="h-3.5 w-3.5" />
                <span>Access level: {record.accessLevel.replace('-', ' ')}</span>
              </div>
            </div>
            
            <div className="pt-1">
              {getAccessLevelBadge(record.accessLevel)}
            </div>
          </div>
          
          {record.status === 'active' && (
            <div className="md:self-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20 dark:text-red-400 dark:hover:text-red-300"
                onClick={() => onRevokeAccess(record.id)}
              >
                <X className="h-4 w-4 mr-1" /> 
                Revoke Access
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SharedRecordCard;
