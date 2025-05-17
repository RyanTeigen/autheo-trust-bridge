
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, WalletCards } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DataVaultCard: React.FC = () => {
  const { toast } = useToast();
  
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
        </div>
        <CardDescription className="text-xs">
          Import new health records or upload documents
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 pt-1 pb-3 px-3">
        <Button 
          className="w-full flex items-center justify-center gap-2 shadow-sm text-sm py-1 h-auto" 
          variant="autheo" 
          onClick={() => 
            toast({
              title: "Feature in Development",
              description: "The ability to import records will be available soon.",
            })
          }>
          <PlusCircle className="h-3.5 w-3.5" />
          Import from Provider
        </Button>
        <Button 
          className="w-full flex items-center justify-center gap-2 border-slate-200 hover:bg-slate-50 transition-colors text-sm py-1 h-auto" 
          variant="outline" 
          onClick={() => 
            toast({
              title: "Feature in Development",
              description: "The ability to upload documents will be available soon.",
            })
          }>
          <FileText className="h-3.5 w-3.5" />
          Upload Document
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataVaultCard;
