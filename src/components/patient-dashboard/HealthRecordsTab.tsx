
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, FileText, Calendar, User, Share2, Download, Upload, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SimpleMedicalRecordForm from '@/components/medical/SimpleMedicalRecordForm';
import { ExportRecordButton } from '@/components/patient/ExportRecordButton';
import { ImportRecordButton } from '@/components/patient/ImportRecordButton';
import { RecordIntegrityBadge } from '@/components/patient/RecordIntegrityBadge';
import { useToast } from '@/hooks/use-toast';

interface HealthRecord {
  id: string;
  record_type: string;
  created_at: string;
  encrypted_data: string;
  iv?: string;
  record_hash?: string;
  anchored_at?: string;
  integrity?: {
    hasHash: boolean;
    isAnchored: boolean;
    anchoredAt?: string;
    anchoringInProgress?: boolean;
  };
}

interface HealthRecordsTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  handleToggleShare: (id: string, shared: boolean) => void;
}

const HealthRecordsTab: React.FC<HealthRecordsTabProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  handleToggleShare,
}) => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration with integrity information
  useEffect(() => {
    const mockRecords: HealthRecord[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        record_type: 'Lab Results',
        created_at: '2024-01-15T10:30:00Z',
        encrypted_data: 'encrypted_lab_data_here',
        record_hash: 'a1b2c3d4e5f6',
        anchored_at: '2024-01-15T10:35:00Z',
        integrity: {
          hasHash: true,
          isAnchored: true,
          anchoredAt: '2024-01-15T10:35:00Z'
        }
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        record_type: 'Prescription',
        created_at: '2024-01-10T14:45:00Z',
        encrypted_data: 'encrypted_prescription_data_here',
        record_hash: 'b2c3d4e5f6g7',
        integrity: {
          hasHash: true,
          isAnchored: false
        }
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        record_type: 'Imaging',
        created_at: '2024-01-05T09:15:00Z',
        encrypted_data: 'encrypted_imaging_data_here',
        integrity: {
          hasHash: false,
          isAnchored: false
        }
      },
    ];

    setTimeout(() => {
      setRecords(mockRecords);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.record_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || record.record_type.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleImportSuccess = () => {
    // Refresh records list or handle successful import
    toast({
      title: "Record Imported",
      description: "Your medical record has been successfully imported and added to your collection.",
    });
    // In a real implementation, you would refetch the records here
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-700 rounded w-full"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Import/Export Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Health Records</h2>
          <p className="text-slate-400">Manage your encrypted medical records with blockchain integrity verification</p>
        </div>
        
        <div className="flex gap-2">
          <ImportRecordButton 
            onImportSuccess={handleImportSuccess}
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          />
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="autheo">
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Medical Record</DialogTitle>
              </DialogHeader>
              <SimpleMedicalRecordForm 
                onSubmit={async () => {
                  setShowAddDialog(false);
                  toast({
                    title: "Success",
                    description: "Medical record added successfully",
                  });
                }}
                onCancel={() => setShowAddDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search your health records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-slate-200"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-800 border-slate-600 text-slate-200">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="all">All Records</SelectItem>
            <SelectItem value="lab">Lab Results</SelectItem>
            <SelectItem value="prescription">Prescriptions</SelectItem>
            <SelectItem value="imaging">Imaging</SelectItem>
            <SelectItem value="visit">Visit Notes</SelectItem>
            <SelectItem value="imported">Imported Records</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records Grid */}
      <div className="grid gap-4">
        {filteredRecords.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-slate-400 opacity-50" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No Records Found</h3>
              <p className="text-slate-400 mb-4">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your health records will appear here once they are added'
                }
              </p>
              <div className="flex justify-center gap-2">
                <ImportRecordButton 
                  onImportSuccess={handleImportSuccess}
                  className="text-slate-300 border-slate-600 hover:bg-slate-700"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-autheo-primary/20 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-autheo-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-200 text-lg">{record.record_type}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-400">
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-800">
                      Encrypted
                    </Badge>
                    {record.integrity && (
                      <RecordIntegrityBadge integrity={record.integrity} />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    <div>Record ID: {record.id.slice(0, 8)}...</div>
                    {record.record_hash && (
                      <div className="mt-1">Hash: {record.record_hash}</div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleShare(record.id, false)}
                      className="text-slate-300 border-slate-600 hover:bg-slate-700"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    
                    <ExportRecordButton 
                      recordId={record.id}
                      recordType={record.record_type}
                      className="text-slate-300 border-slate-600 hover:bg-slate-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default HealthRecordsTab;
