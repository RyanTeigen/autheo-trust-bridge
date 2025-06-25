
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, FileText, Calendar, User, Share2, Download } from 'lucide-react';
import { ExportRecordButton } from '@/components/patient/ExportRecordButton';
import { useToast } from '@/hooks/use-toast';

interface HealthRecord {
  id: string;
  record_type: string;
  created_at: string;
  encrypted_data: string;
  iv?: string;
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
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockRecords: HealthRecord[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        record_type: 'Lab Results',
        created_at: '2024-01-15T10:30:00Z',
        encrypted_data: 'encrypted_lab_data_here',
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        record_type: 'Prescription',
        created_at: '2024-01-10T14:45:00Z',
        encrypted_data: 'encrypted_prescription_data_here',
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        record_type: 'Imaging',
        created_at: '2024-01-05T09:15:00Z',
        encrypted_data: 'encrypted_imaging_data_here',
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
              <p className="text-slate-400">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your health records will appear here once they are added'
                }
              </p>
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
                  
                  <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-800">
                    Encrypted
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Record ID: {record.id.slice(0, 8)}...
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
