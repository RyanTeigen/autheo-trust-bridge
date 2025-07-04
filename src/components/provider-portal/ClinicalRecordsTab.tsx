import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, FileText, Calendar, User, Stethoscope, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClinicalRecords } from '@/hooks/useClinicalRecords';
import ClinicalRecordForm from './ClinicalRecordForm';
import ClinicalRecordShareDialog from '@/components/shared-records/ClinicalRecordShareDialog';

interface ClinicalRecord {
  id: string;
  patient_id: string;
  provider_id: string;
  record_type: string;
  encrypted_data: string;
  created_at: string;
  patient_name?: string;
  patient_email?: string;
  patient_user_id?: string;
}

interface Patient {
  id: string;
  full_name: string;
  email?: string;
  user_id: string;
}

const ClinicalRecordsTab: React.FC = () => {
  const { 
    records, 
    loading, 
    error, 
    fetchClinicalRecords, 
    createClinicalRecord,
    shareRecordWithPatient 
  } = useClinicalRecords();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState<{
    isOpen: boolean;
    record: ClinicalRecord | null;
    patient: Patient | null;
  }>({
    isOpen: false,
    record: null,
    patient: null
  });
  const { toast } = useToast();

  // Load clinical records on component mount
  useEffect(() => {
    fetchClinicalRecords();
  }, [fetchClinicalRecords]);

  const filteredRecords = records.filter(record => 
    record.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.record_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRecordCreated = () => {
    setShowCreateDialog(false);
    toast({
      title: "Clinical Record Created",
      description: "The clinical record has been successfully created and encrypted.",
    });
    // Refresh the records list
    fetchClinicalRecords();
  };

  const handleShareRecord = (record: ClinicalRecord) => {
    // We need to get the patient's auth user ID, not the patient record ID
    const mockPatient: Patient = {
      id: record.patient_id, // This is the patient record ID from patients table
      full_name: record.patient_name || 'Unknown Patient',
      email: record.patient_email,
      user_id: record.patient_user_id || record.patient_id // This should be the auth user ID
    };
    
    setShareDialog({
      isOpen: true,
      record,
      patient: mockPatient
    });
  };

  const handleShareComplete = async (
    recordId: string, 
    patientUserId: string, // This should be the auth user ID
    permissionType: 'read' | 'write', 
    expiresAt?: string
  ) => {
    const success = await shareRecordWithPatient(recordId, patientUserId, permissionType, expiresAt);
    if (success) {
      setShareDialog({ isOpen: false, record: null, patient: null });
    }
    return success;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Clinical Records</h2>
          <p className="text-slate-400">Create and manage clinical records for your patients</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="autheo">
              <Plus className="h-4 w-4 mr-2" />
              Create Clinical Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-autheo-primary" />
                Create Clinical Record
              </DialogTitle>
            </DialogHeader>
            <ClinicalRecordForm 
              onSuccess={handleRecordCreated}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search clinical records by patient name or record type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-slate-800 border-slate-600 text-slate-200"
        />
      </div>

      {/* Records Grid */}
      <div className="grid gap-4">
        {filteredRecords.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-slate-400 opacity-50" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No Clinical Records Found</h3>
              <p className="text-slate-400 mb-4">
                {searchQuery 
                  ? 'No records match your search criteria'
                  : 'Start creating clinical records for your patients'
                }
              </p>
              <Button 
                variant="autheo" 
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Record
              </Button>
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
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-400">{record.patient_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-800">
                      Clinical
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-900/20 text-blue-400 border-blue-800">
                      Encrypted
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(record.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1">Record ID: {record.id.slice(0, 8)}...</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline" 
                      size="sm"
                      className="text-slate-300 border-slate-600 hover:bg-slate-700"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm" 
                      onClick={() => handleShareRecord(record)}
                      className="text-slate-300 border-slate-600 hover:bg-slate-700"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share with Patient
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Share Dialog */}
      {shareDialog.record && shareDialog.patient && (
        <ClinicalRecordShareDialog
          isOpen={shareDialog.isOpen}
          onClose={() => setShareDialog({ isOpen: false, record: null, patient: null })}
          recordId={shareDialog.record.id}
          recordTitle={`${shareDialog.record.record_type} - ${shareDialog.record.patient_name}`}
          patient={shareDialog.patient}
          onShare={handleShareComplete}
        />
      )}
    </div>
  );
};

export default ClinicalRecordsTab;