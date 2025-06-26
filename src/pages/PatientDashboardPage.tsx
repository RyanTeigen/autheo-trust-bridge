
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/dashboard/PageHeader';
import RevampedDashboardTabs from '@/components/patient-dashboard/RevampedDashboardTabs';
import AtomicDataForm from '@/components/patient/AtomicDataForm';
import { getOrCreateMedicalRecord } from '@/utils/record';
import { Card, CardContent } from '@/components/ui/card';

const PatientDashboardPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [recordId, setRecordId] = useState<string | null>(null);
  const [recordLoading, setRecordLoading] = useState(true);

  useEffect(() => {
    const fetchOrCreateRecord = async () => {
      if (!user?.id) {
        setRecordLoading(false);
        return;
      }
      
      console.log('Fetching or creating medical record for user:', user.id);
      const id = await getOrCreateMedicalRecord(user.id);
      setRecordId(id);
      setRecordLoading(false);
    };
    
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
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-slate-500">Loading medical record...</p>
              </CardContent>
            </Card>
          ) : recordId ? (
            <AtomicDataForm recordId={recordId} />
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-red-500">
                  Unable to load or create medical record. Please try refreshing the page.
                </p>
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
