
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DataVaultCard: React.FC = () => {
  const { toast } = useToast();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Data Vault</CardTitle>
        <CardDescription>
          Import new health records from providers or upload documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <Button className="w-full flex items-center justify-center gap-2" onClick={() => 
            toast({
              title: "Feature in Development",
              description: "The ability to import records will be available soon.",
            })
          }>
            <PlusCircle className="h-4 w-4" />
            Import from Provider
          </Button>
          <Button className="w-full flex items-center justify-center gap-2" variant="outline" onClick={() => 
            toast({
              title: "Feature in Development",
              description: "The ability to upload documents will be available soon.",
            })
          }>
            <FileText className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataVaultCard;
