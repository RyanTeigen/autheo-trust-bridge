
import React, { useState, useEffect } from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/dashboard/PageHeader';
import RevampedDashboardTabs from '@/components/patient-dashboard/RevampedDashboardTabs';
import AtomicDataForm from '@/components/patient/AtomicDataForm';
import { getOrCreateMedicalRecord } from '@/utils/record';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const PatientDashboardPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [recordId, setRecordId] = useState<string | null>(null);
  const [recordLoading, setRecordLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrCreateRecord = async () => {
    if (!user?.id) {
      setRecordLoading(false);
      setError('Please log in to access your medical records.');
      return;
    }
    
    console.log('Fetching or creating medical record for user:', user.id);
    setError(null);
    setRecordLoading(true);
    
    try {
      const id = await getOrCreateMedicalRecord(user.id);
      
      if (id) {
        setRecordId(id);
        console.log('Successfully loaded medical record:', id);
      } else {
        setError('Failed to load or create medical record. This might be due to database permissions. Please try refreshing the page or contact support if the issue persists.');
      }
    } catch (err) {
      console.error('Error in fetchOrCreateRecord:', err);
      setError('An unexpected error occurred while loading your medical record. Please try again.');
    } finally {
      setRecordLoading(false);
    }
  };

  useEffect(() => {
    fetchOrCreateRecord();
  }, [user]);

  const handleToggleShare = (id: string, shared: boolean) => {
    console.log('Toggle share for record:', id, 'to', shared);
    // Implementation would go here
  };

  const handleShareHealthInfo = () => {
    console.log('Share health info');
    // Implementation would go here
  };

  const handleRetry = () => {
    fetchOrCreateRecord();
  };

  // Show authentication prompt if user is not logged in
  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Health Dashboard"
          description="Your personal health management platform with quantum-safe sharing and comprehensive health tracking"
          icon={<Heart className="h-8 w-8 text-autheo-primary" />}
        />
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <Alert className="border-amber-500/30 bg-amber-900/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-slate-200">
                Please log in to access your health dashboard and medical records.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Health Dashboard"
        description="Your personal health management platform with quantum-safe sharing and comprehensive health tracking"
        icon={<Heart className="h-8 w-8 text-autheo-primary" />}
      />
      
      {/* Vitals Input Section - Only show when on dashboard */}
      {activeSection === 'dashboard' && (
        <div className="mb-6">
          {recordLoading ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-autheo-primary"></div>
                  <p className="text-center text-slate-300">Loading your medical record...</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Alert className="border-red-500/30 bg-red-900/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-slate-200 flex items-center justify-between">
                <span>{error}</span>
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  size="sm"
                  className="ml-4"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          ) : recordId ? (
            <AtomicDataForm recordId={recordId} />
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <Alert className="border-amber-500/30 bg-amber-900/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-slate-200 flex items-center justify-between">
                    <span>No medical record found. Click to create one.</span>
                    <Button 
                      onClick={handleRetry}
                      variant="outline"
                      size="sm"
                      className="ml-4"
                    >
                      Create Record
                    </Button>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      <RevampedDashboardTabs
        handleToggleShare={handleToggleShare}
        handleShareHealthInfo={handleShareHealthInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
};

export default PatientDashboardPage;
