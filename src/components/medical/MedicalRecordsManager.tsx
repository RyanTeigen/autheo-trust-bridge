
import React, { useState } from 'react';
import MedicalRecordForm from './MedicalRecordForm';
import EmptyRecordsState from './EmptyRecordsState';
import MedicalRecordsControls from './MedicalRecordsControls';
import MedicalRecordsLoadingSkeleton from './MedicalRecordsLoadingSkeleton';
import MedicalRecordsGrid from './MedicalRecordsGrid';
import { useMedicalRecordsManager } from '@/hooks/useMedicalRecordsManager';

interface DecryptedRecord {
  id: string;
  patient_id: string;
  data: any;
  record_type: string;
  created_at: string;
  updated_at: string;
}

const MedicalRecordsManager = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DecryptedRecord | null>(null);
  
  const {
    records,
    loading,
    searchTerm,
    filterType,
    setSearchTerm,
    setFilterType,
    handleCreateRecord,
    handleUpdateRecord,
    handleDeleteRecord
  } = useMedicalRecordsManager();

  const onCreateRecord = async (data: any) => {
    const success = await handleCreateRecord(data);
    if (success) {
      setShowCreateForm(false);
    }
  };

  const onUpdateRecord = async (data: any) => {
    if (selectedRecord) {
      const success = await handleUpdateRecord(selectedRecord.id, data);
      if (success) {
        setSelectedRecord(null);
      }
    }
  };

  const onDeleteRecord = async () => {
    if (selectedRecord) {
      const success = await handleDeleteRecord(selectedRecord.id);
      if (success) {
        setSelectedRecord(null);
      }
    }
  };

  if (showCreateForm) {
    return (
      <MedicalRecordForm
        onSubmit={onCreateRecord}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (selectedRecord) {
    return (
      <MedicalRecordForm
        record={selectedRecord}
        onSubmit={onUpdateRecord}
        onCancel={() => setSelectedRecord(null)}
        onDelete={onDeleteRecord}
      />
    );
  }

  return (
    <div className="space-y-6">
      <MedicalRecordsControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterChange={setFilterType}
        onCreateRecord={() => setShowCreateForm(true)}
      />

      {loading ? (
        <MedicalRecordsLoadingSkeleton />
      ) : records.length === 0 ? (
        <EmptyRecordsState onCreateRecord={() => setShowCreateForm(true)} />
      ) : (
        <MedicalRecordsGrid
          records={records}
          onRecordSelect={setSelectedRecord}
        />
      )}
    </div>
  );
};

export default MedicalRecordsManager;
