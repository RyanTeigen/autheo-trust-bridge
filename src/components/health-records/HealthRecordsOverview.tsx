
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import { useNavigate } from 'react-router-dom';
import { 
  Pill, 
  FileText, 
  Heart,
  Calendar, 
  ShieldAlert, 
  ChartBar, 
  ArrowRight, 
  FileSearch 
} from 'lucide-react';

const HealthRecordsOverview = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  
  const {
    healthRecords,
    medications,
    diagnoses,
    allergies,
    immunizations,
    medicalTests,
    healthMetrics,
    summary,
    toggleRecordSharing
  } = useHealthRecords();

  const handleViewMore = (section: string) => {
    toast({
      title: `View More: ${section}`,
      description: `Navigating to full ${section.toLowerCase()} view.`
    });
    navigate('/wallet');
  };

  const handleShareRecord = (id: string, shared: boolean) => {
    toggleRecordSharing(id, shared);
    toast({
      title: shared ? "Record shared" : "Record unshared",
      description: `The selected health record has been ${shared ? 'added to' : 'removed from'} your shared data.`,
    });
  };

  const handleNavigateToShared = () => {
    navigate('/shared-records');
  };

  const renderSummaryMetrics = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-3">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase text-slate-400 mb-1">Total Records</span>
              <span className="text-2xl font-bold text-autheo-primary">{summary.total}</span>
              <span className="text-xs text-slate-300 mt-1">All health documents</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-3">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase text-slate-400 mb-1">Shared</span>
              <span className="text-2xl font-bold text-autheo-primary">{summary.shared}</span>
              <span className="text-xs text-slate-300 mt-1">With providers</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-3">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase text-slate-400 mb-1">Categories</span>
              <span className="text-2xl font-bold text-autheo-primary">{Object.keys(summary.categories).length}</span>
              <span className="text-xs text-slate-300 mt-1">Types of records</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-3">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase text-slate-400 mb-1">Latest</span>
              <span className="text-2xl font-bold text-autheo-primary">
                {new Date().getDate() - new Date(healthRecords[0]?.date || Date.now()).getDate()}d
              </span>
              <span className="text-xs text-slate-300 mt-1">Since last update</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication': return <Pill className="h-4 w-4 text-autheo-primary" />;
      case 'condition': return <Heart className="h-4 w-4 text-autheo-primary" />;
      case 'lab': return <FileSearch className="h-4 w-4 text-autheo-primary" />;
      case 'imaging': return <FileText className="h-4 w-4 text-autheo-primary" />;
      case 'note': return <FileText className="h-4 w-4 text-autheo-primary" />;
      case 'visit': return <Calendar className="h-4 w-4 text-autheo-primary" />;
      default: return <FileText className="h-4 w-4 text-autheo-primary" />;
    }
  };

  const renderRecentRecords = () => {
    const recentRecords = healthRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);

    return (
      <div className="space-y-3">
        {recentRecords.map(record => (
          <div key={record.id} className="p-3 border border-slate-700 rounded-md bg-slate-800/30">
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                {renderCategoryIcon(record.category)}
                <div>
                  <p className="font-medium text-autheo-primary">{record.title}</p>
                  <p className="text-sm text-slate-300">{record.provider} - {new Date(record.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={record.isShared ? 'outline' : 'secondary'} className="text-xs">
                  {record.isShared ? 'Shared' : 'Private'}
                </Badge>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex justify-end">
          <Button 
            variant="link" 
            className="text-autheo-primary hover:text-autheo-primary/80 p-0"
            onClick={() => handleViewMore("Health Records")}
          >
            View all records <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  const renderMedicationsTab = () => {
    return (
      <div className="space-y-3">
        {medications.slice(0, 3).map(med => (
          <Card key={med.id} className="overflow-hidden bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-autheo-primary">{med.name} {med.dosage}</p>
                  <p className="text-sm text-slate-300">{med.frequency}</p>
                  <p className="text-xs mt-1">Next refill: {new Date(med.refillDate).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline" className="bg-blue-100/10 text-blue-300 border-blue-300/30">
                  Medication
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <div className="flex justify-end">
          <Button 
            variant="link" 
            className="text-autheo-primary hover:text-autheo-primary/80 p-0"
            onClick={() => handleViewMore("Medications")}
          >
            View all medications <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  const renderConditionsTab = () => {
    return (
      <div className="space-y-3">
        {diagnoses.map(diagnosis => (
          <Card key={diagnosis.id} className="overflow-hidden bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-autheo-primary">{diagnosis.condition}</p>
                  <p className="text-sm text-slate-300">
                    Diagnosed: {new Date(diagnosis.diagnosedDate).toLocaleDateString()} by {diagnosis.diagnosedBy}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    diagnosis.status === 'active' ? "bg-amber-100/10 text-amber-300 border-amber-300/30" :
                    diagnosis.status === 'resolved' ? "bg-green-100/10 text-green-300 border-green-300/30" :
                    "bg-purple-100/10 text-purple-300 border-purple-300/30"
                  }
                >
                  {diagnosis.status.charAt(0).toUpperCase() + diagnosis.status.slice(1)}
                </Badge>
              </div>
              {diagnosis.notes && (
                <p className="text-xs text-slate-400 mt-2">{diagnosis.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderAllergiesTab = () => {
    return (
      <div className="space-y-3">
        {allergies.map(allergy => (
          <Card key={allergy.id} className="overflow-hidden bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-autheo-primary">{allergy.name}</p>
                  <p className="text-sm text-slate-300">Reaction: {allergy.reaction}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Diagnosed: {new Date(allergy.diagnosed).toLocaleDateString()}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    allergy.severity === 'mild' ? "bg-green-100/10 text-green-300 border-green-300/30" :
                    allergy.severity === 'moderate' ? "bg-amber-100/10 text-amber-300 border-amber-300/30" :
                    "bg-red-100/10 text-red-300 border-red-300/30"
                  }
                >
                  {allergy.severity.charAt(0).toUpperCase() + allergy.severity.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-autheo-primary">Health Records</CardTitle>
            <CardDescription className="text-slate-300">
              Your comprehensive health information in one place
            </CardDescription>
          </div>
          <div>
            <Button 
              size="sm" 
              onClick={handleNavigateToShared}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
            >
              Manage Sharing
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 bg-slate-700 dark:bg-slate-700">
            <TabsTrigger value="summary" className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary">
              Summary
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary">
              Recent
            </TabsTrigger>
            <TabsTrigger value="medications" className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary">
              Medications
            </TabsTrigger>
            <TabsTrigger value="conditions" className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary">
              Conditions
            </TabsTrigger>
            <TabsTrigger value="allergies" className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary">
              Allergies
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            {renderSummaryMetrics()}
          </TabsContent>
          
          <TabsContent value="recent">
            {renderRecentRecords()}
          </TabsContent>
          
          <TabsContent value="medications">
            {renderMedicationsTab()}
          </TabsContent>
          
          <TabsContent value="conditions">
            {renderConditionsTab()}
          </TabsContent>
          
          <TabsContent value="allergies">
            {renderAllergiesTab()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HealthRecordsOverview;
