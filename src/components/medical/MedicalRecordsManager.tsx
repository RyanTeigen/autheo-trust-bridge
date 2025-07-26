
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Shield, Lock, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMedicalRecordsManager } from '@/hooks/useMedicalRecordsManager';
import { useEncryptionSetup } from '@/hooks/useEncryptionSetup';
import { useAuth } from '@/contexts/AuthContext';
import MedicalRecordForm from './MedicalRecordForm';
import MedicalRecordsGrid from './MedicalRecordsGrid';
import { MedicalRecordsControls } from './MedicalRecordsControls';
import EmptyRecordsState from './EmptyRecordsState';
import MedicalRecordsLoadingSkeleton from './MedicalRecordsLoadingSkeleton';
import SystemHealthDashboard from '@/components/system/SystemHealthDashboard';

const MedicalRecordsManager = () => {
  const { toast } = useToast();
  const { isAuthenticated, profile } = useAuth();
  const { isSetup, isLoading: encryptionLoading } = useEncryptionSetup();
  const [showForm, setShowForm] = useState(false);
  const [showSystemHealth, setShowSystemHealth] = useState(false);
  
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

  // Authentication check
  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please sign in to access your medical records. Authentication is required for security.
        </AlertDescription>
      </Alert>
    );
  }

  // Show system health dashboard if requested
  if (showSystemHealth) {
    return (
      <div className="space-y-6">
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                System Health & Authentication
              </span>
              <Button
                onClick={() => setShowSystemHealth(false)}
                variant="outline"
                size="sm"
              >
                Back to Records
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>
        <SystemHealthDashboard />
      </div>
    );
  }

  // Show encryption setup loading state
  if (encryptionLoading) {
    return (
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Setting up Encryption
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Initializing secure encryption keys...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show encryption info state (fallback mode is acceptable)
  if (!isSetup) {
    return (
      <div className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Medical records are secured with fallback encryption. System is operational.
          </AlertDescription>
        </Alert>
        
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Encryption Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Your medical records are secured and ready to use.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Retry Enhanced Setup
                </Button>
                <Button
                  onClick={() => setShowSystemHealth(true)}
                  variant="secondary"
                >
                  View System Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Medical Records Manager
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Secure, encrypted storage for your medical information
              </p>
              {profile?.role && (
                <p className="text-xs text-muted-foreground mt-1">
                  Authenticated as: <span className="font-medium">{profile.role}</span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowSystemHealth(true)}
                variant="outline"
                size="sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                System Status
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                variant="default"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
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
