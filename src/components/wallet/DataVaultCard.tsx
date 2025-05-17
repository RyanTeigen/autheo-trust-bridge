
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, WalletCards } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DataVaultCard: React.FC = () => {
  const { toast } = useToast();
  
  return (
    <Card className="border-slate-200 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-autheo-primary to-autheo-secondary" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <WalletCards className="h-5 w-5 text-autheo-primary" />
            Health Data Vault
          </CardTitle>
        </div>
        <CardDescription>
          Import new health records or upload documents
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button className="w-full flex items-center justify-center gap-2" 
          variant="autheo" 
          onClick={() => 
            toast({
              title: "Feature in Development",
              description: "The ability to import records will be available soon.",
            })
          }>
          <PlusCircle className="h-4 w-4" />
          Import from Provider
        </Button>
        <Button className="w-full flex items-center justify-center gap-2" 
          variant="outline" 
          onClick={() => 
            toast({
              title: "Feature in Development",
              description: "The ability to upload documents will be available soon.",
            })
          }>
          <FileText className="h-4 w-4" />
          Upload Document
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataVaultCard;
