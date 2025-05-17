
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, WalletCards, ChevronUp, ChevronDown, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const DataVaultCard: React.FC = () => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  
  // Simulated vault status - in a real app, this would come from your backend
  const recentImports = [
    { id: '1', name: 'Lab Results', date: '2 days ago', status: 'complete' },
    { id: '2', name: 'MRI Scan', date: '1 week ago', status: 'complete' },
    { id: '3', name: 'Vaccination Record', date: 'Just now', status: 'processing' },
  ];
  
  const showFeatureInDevelopment = () => {
    toast({
      title: "Feature in Development",
      description: "This feature will be available soon.",
    });
  };
  
  return (
    <Card className="border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="h-2 bg-gradient-to-r from-autheo-primary to-autheo-secondary" />
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-lg">
            <div className="p-1.5 rounded-md bg-autheo-primary/10">
              <WalletCards className="h-4 w-4 text-autheo-primary" />
            </div>
            Health Data Vault
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </Button>
        </div>
        <CardDescription className="text-xs">
          Import new health records or upload documents
        </CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-2 pt-1 pb-3 px-3">
        <Button 
          className="w-full flex items-center justify-center gap-2 shadow-sm text-sm py-1 h-auto" 
          variant="autheo" 
          onClick={showFeatureInDevelopment}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Import from Provider
        </Button>
        <Button 
          className="w-full flex items-center justify-center gap-2 border-slate-200 hover:bg-slate-50 transition-colors text-sm py-1 h-auto" 
          variant="outline" 
          onClick={showFeatureInDevelopment}
        >
          <FileText className="h-3.5 w-3.5" />
          Upload Document
        </Button>
        
        {expanded && (
          <div className="mt-1 border-t pt-2 space-y-2">
            <div className="text-xs font-medium text-slate-700">Recent Imports</div>
            {recentImports.map((item) => (
              <div key={item.id} className="bg-slate-50 rounded-md p-2 text-xs">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-slate-500">{item.date}</div>
                </div>
                <div className="mt-1.5">
                  {item.status === 'processing' ? (
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="h-1.5" />
                      <div className="flex items-center text-amber-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Processing
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataVaultCard;
