
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Upload, Lock, Shield, Check, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  shared: boolean;
  category: 'Lab Results' | 'Imaging' | 'Clinical Notes' | 'Prescriptions' | 'Other';
}

interface DocumentSharingProps {
  patientId?: string;
  onDocumentSelect?: (documentId: string) => void;
}

const DocumentSharing: React.FC<DocumentSharingProps> = ({ patientId, onDocumentSelect }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc1',
      name: 'Complete Blood Count.pdf',
      type: 'PDF',
      size: '1.2 MB',
      date: '2025-05-10',
      shared: true,
      category: 'Lab Results'
    },
    {
      id: 'doc2',
      name: 'Chest X-Ray.jpg',
      type: 'Image',
      size: '3.7 MB',
      date: '2025-05-12',
      shared: false,
      category: 'Imaging'
    },
    {
      id: 'doc3',
      name: 'Follow-up Clinical Notes.docx',
      type: 'Document',
      size: '0.5 MB',
      date: '2025-05-15',
      shared: false,
      category: 'Clinical Notes'
    },
    {
      id: 'doc4',
      name: 'Medication Prescription.pdf',
      type: 'PDF',
      size: '0.3 MB',
      date: '2025-05-17',
      shared: true,
      category: 'Prescriptions'
    }
  ]);

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShareToggle = (id: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, shared: !doc.shared } : doc
    ));
    
    const doc = documents.find(d => d.id === id);
    if (doc) {
      toast({
        title: doc.shared ? "Document unshared" : "Document shared",
        description: doc.shared 
          ? `${doc.name} is no longer shared with the patient` 
          : `${doc.name} is now shared with the patient`,
      });
    }
  };

  const handleSelectDocument = (id: string) => {
    if (onDocumentSelect) {
      onDocumentSelect(id);
    } else {
      const doc = documents.find(d => d.id === id);
      if (doc) {
        toast({
          title: "Document selected",
          description: `Viewing ${doc.name}`,
        });
      }
    }
  };

  const handleUploadDocument = () => {
    toast({
      title: "Upload Document",
      description: "Document upload functionality will be available soon.",
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-autheo-primary">Patient Documents</CardTitle>
            <CardDescription className="text-slate-300">
              Manage and share secure patient documents
            </CardDescription>
          </div>
          <Button 
            size="sm"
            className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
            onClick={handleUploadDocument}
          >
            <Upload className="h-4 w-4 mr-1.5" /> Upload
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-4">
          <Input 
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>
        
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map(document => (
              <div 
                key={document.id}
                className="flex items-center justify-between p-3 bg-slate-700/40 rounded-md hover:bg-slate-700/60 transition-colors"
              >
                <div className="flex items-center flex-1">
                  <div className="bg-autheo-primary/20 p-2 rounded">
                    <FileText className="h-5 w-5 text-autheo-primary" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-slate-100 truncate max-w-[200px]">{document.name}</p>
                      <Badge 
                        variant="outline" 
                        className="ml-2 border-slate-600 text-xs"
                      >
                        {document.category}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-slate-400 mt-1">
                      <span>{document.type}</span>
                      <span className="mx-2">•</span>
                      <span>{document.size}</span>
                      <span className="mx-2">•</span>
                      <span>{document.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-300"
                    onClick={() => handleSelectDocument(document.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={document.shared ? "default" : "outline"}
                    className={`h-8 w-8 ${document.shared ? 'bg-green-600 hover:bg-green-700' : 'border-slate-600 text-slate-300'}`}
                    onClick={() => handleShareToggle(document.id)}
                  >
                    {document.shared ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <FileText className="mx-auto h-12 w-12 text-slate-600 mb-2" />
              <p>No documents found</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-slate-700 p-4 text-xs text-slate-400">
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-1.5 text-autheo-primary" />
          All documents are encrypted and HIPAA compliant
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentSharing;
