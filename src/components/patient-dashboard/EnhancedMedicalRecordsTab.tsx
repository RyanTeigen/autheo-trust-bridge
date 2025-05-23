
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Share, Users, Bell } from 'lucide-react';

import EnhancedNotesView from '@/components/health-records/EnhancedNotesView';
import DecentralizedTransfer from '@/components/patient-dashboard/DecentralizedTransfer';
import AccessNotifications from '@/components/patient-dashboard/AccessNotifications';
import NoteAccessManager from '@/components/patient-dashboard/NoteAccessManager';

const EnhancedMedicalRecordsTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('records');
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchNotes = async () => {
      setLoading(true);
      try {
        // Fetch SOAP notes
        const { data, error } = await supabase
          .from('soap_notes')
          .select(`
            id,
            visit_date,
            subjective,
            objective,
            assessment,
            plan,
            provider_id,
            distribution_status,
            decentralized_refs,
            created_at,
            updated_at
          `)
          .eq('patient_id', user.id)
          .order('visit_date', { ascending: false });
          
        if (error) throw error;
        
        // Get provider names in a separate query
        const providerIds = [...new Set(data.map(note => note.provider_id))];
        const { data: providersData, error: providersError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', providerIds);
          
        if (providersError) throw providersError;
        
        // Create a map of provider IDs to names
        const providerMap = new Map();
        providersData?.forEach(provider => {
          providerMap.set(provider.id, {
            first_name: provider.first_name || '',
            last_name: provider.last_name || ''
          });
        });
        
        // Transform data to include provider name
        const transformedData = data.map(note => {
          const provider = providerMap.get(note.provider_id);
          return {
            ...note,
            provider_name: provider 
              ? `${provider.first_name} ${provider.last_name}`.trim() || 'Unknown Provider'
              : 'Unknown Provider',
            profiles: provider || { first_name: '', last_name: '' }
          };
        });
        
        setNotes(transformedData);
        
        // Set first note as selected by default if available
        if (transformedData.length > 0 && !selectedNote) {
          setSelectedNote(transformedData[0].id);
        }
        
      } catch (err) {
        console.error("Error fetching notes:", err);
        toast({
          title: "Error",
          description: "Could not load your medical notes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, [user, toast, selectedNote]);
  
  const handleSelectNote = (noteId: string) => {
    setSelectedNote(noteId);
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-slate-200 dark:bg-slate-800">
          <TabsTrigger 
            value="records" 
            className="flex items-center gap-1.5 px-4 data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
          >
            <FileText className="h-4 w-4" /> My Medical Records
          </TabsTrigger>
          <TabsTrigger 
            value="transfer" 
            className="flex items-center gap-1.5 px-4 data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
          >
            <Share className="h-4 w-4" /> Record Transfer
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="flex items-center gap-1.5 px-4 data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
          >
            <Bell className="h-4 w-4" /> Access Notifications
          </TabsTrigger>
        </TabsList>
        
        {/* Medical Records Tab */}
        <TabsContent value="records" className="mt-0">
          <EnhancedNotesView 
            notes={notes} 
            selectedNote={selectedNote}
            onSelectNote={handleSelectNote}
          />
        </TabsContent>
        
        {/* Record Transfer Tab */}
        <TabsContent value="transfer" className="mt-0">
          <DecentralizedTransfer />
        </TabsContent>
        
        {/* Access Notifications Tab */}
        <TabsContent value="notifications" className="mt-0">
          <AccessNotifications />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedMedicalRecordsTab;
