
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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    notes: ''
  });
  
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

  const onCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleCreateRecord(formData);
    if (success) {
      setShowCreateForm(false);
      setFormData({ title: '', description: '', category: 'general', notes: '' });
    }
  };

  const onUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecord) {
      const success = await handleUpdateRecord(selectedRecord.id, formData);
      if (success) {
        setSelectedRecord(null);
        setFormData({ title: '', description: '', category: 'general', notes: '' });
      }
    }
  };

  const onDeleteRecord = async () => {
    if (selectedRecord) {
      const success = await handleDeleteRecord(selectedRecord.id);
      if (success) {
        setSelectedRecord(null);
        setFormData({ title: '', description: '', category: 'general', notes: '' });
      }
    }
  };

  const handleRecordSelect = (record: DecryptedRecord) => {
    setSelectedRecord(record);
    setFormData({
      title: record.data.title || '',
      description: record.data.description || '',
      category: record.record_type || 'general',
      notes: record.data.notes || ''
    });
  };

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setFormData({ title: '', description: '', category: 'general', notes: '' });
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setSelectedRecord(null);
    setFormData({ title: '', description: '', category: 'general', notes: '' });
  };

  if (showCreateForm) {
    return (
      <MedicalRecordForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={onCreateRecord}
        onCancel={handleCancel}
        loading={loading}
      />
    );
  }

  if (selectedRecord) {
    return (
      <MedicalRecordForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={onUpdateRecord}
        onCancel={handleCancel}
        onDelete={onDeleteRecord}
        loading={loading}
        isEditing={true}
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
        onCreateRecord={handleCreateClick}
      />

      {loading ? (
        <MedicalRecordsLoadingSkeleton />
      ) : records.length === 0 ? (
        <EmptyRecordsState onCreateRecord={handleCreateClick} />
      ) : (
        <MedicalRecordsGrid
          records={records}
          onRecordSelect={handleRecordSelect}
        />
      )}
    </div>
  );
};

export default MedicalRecordsManager;
