
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Shield, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMedicalRecordsManager } from '@/hooks/useMedicalRecordsManager';
import { useEncryptionSetup } from '@/hooks/useEncryptionSetup';
import MedicalRecordForm from './MedicalRecordForm';
import MedicalRecordsGrid from './MedicalRecordsGrid';
import { MedicalRecordsControls } from './MedicalRecordsControls';
import EmptyRecordsState from './EmptyRecordsState';
import MedicalRecordsLoadingSkeleton from './MedicalRecordsLoadingSkeleton';

const MedicalRecordsManager = () => {
  const { toast } = useToast();
  const { isSetup, isLoading: encryptionLoading } = useEncryptionSetup();
  const [showForm, setShowForm] = useState(false);
  
  const {
    records,
    loading,
    searchTerm,
    filterType,
    setSearchTerm,
    setFilterType,
    handleCreateRecord,
    handleUpdateRecord,
    handleDeleteRecord,
    fetchRecords
  } = useMedicalRecordsManager();

  const handleFormSubmit = async (data: any) => {
    const success = await handleCreateRecord(data);
    if (success) {
      setShowForm(false);
      toast({
        title: "Success",
        description: "Medical record created and encrypted successfully",
      });
    }
  };

  // Show encryption setup loading state
  if (encryptionLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Setting up Encryption
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-autheo-primary"></div>
              <span className="text-slate-300">Initializing secure encryption keys...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show encryption not setup warning
  if (!isSetup) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Encryption Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-300 mb-4">
              Encryption keys are required to store medical records securely.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
            >
              Retry Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-autheo-primary flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Medical Records Manager
              </CardTitle>
              <p className="text-slate-400 mt-1">
                Secure, encrypted storage for your medical information using X25519 encryption
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <MedicalRecordForm
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Controls */}
      <MedicalRecordsControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        recordType={filterType}
        onRecordTypeChange={setFilterType}
        onCreateNew={() => setShowForm(true)}
        showCreateButton={false}
      />

      {/* Content */}
      {loading ? (
        <MedicalRecordsLoadingSkeleton />
      ) : records.length === 0 ? (
        <EmptyRecordsState onCreateRecord={() => setShowForm(true)} />
      ) : (
        <MedicalRecordsGrid
          records={records}
          onUpdate={handleUpdateRecord}
          onDelete={handleDeleteRecord}
        />
      )}
    </div>
  );
};

export default MedicalRecordsManager;
