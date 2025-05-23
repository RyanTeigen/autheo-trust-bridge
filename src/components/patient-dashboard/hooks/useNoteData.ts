
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AccessLevel, NoteAccessControl, AuditLogEntry, SoapNote } from '../types/note';

export function useNoteData(noteId: string | undefined, userId: string | undefined) {
  const { toast } = useToast();
  const [note, setNote] = useState<SoapNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessControls, setAccessControls] = useState<NoteAccessControl[]>([]);
  const [accessHistory, setAccessHistory] = useState<AuditLogEntry[]>([]);
  
  useEffect(() => {
    if (!noteId || !userId) {
      setLoading(false);
      return;
    }
    
    const fetchNote = async () => {
      setLoading(true);
      try {
        // Fetch the note
        const { data, error } = await supabase
          .from('soap_notes')
          .select('*')
          .eq('id', noteId)
          .single();
          
        if (error) throw error;

        // Fetch provider information separately
        const { data: providerData, error: providerError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', data.provider_id)
          .single();
        
        // Create the transformed note with provider info
        const transformedNote: SoapNote = {
          ...data,
          profiles: providerError ? { first_name: '', last_name: '' } : providerData
        };
        
        setNote(transformedNote);
        
        // Fetch access controls
        const { data: accessData, error: accessError } = await supabase
          .from('note_access_controls')
          .select('*')
          .eq('note_id', noteId);
          
        if (accessError) throw accessError;
        
        // Transform the data to ensure access_level is of type AccessLevel
        const transformedAccessData = accessData?.map(control => ({
          ...control,
          access_level: control.access_level as AccessLevel
        })) || [];
        
        setAccessControls(transformedAccessData);

        // Fetch access history (audit logs)
        const { data: historyData, error: historyError } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('resource_id', noteId)
          .eq('resource', 'note_access')
          .order('timestamp', { ascending: false });
          
        if (!historyError && historyData) {
          setAccessHistory(historyData);
        }
        
      } catch (err) {
        console.error("Error fetching note details:", err);
        toast({
          title: "Error",
          description: "Could not load note details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchNote();
  }, [noteId, userId, toast]);
  
  return {
    note,
    loading,
    accessControls,
    accessHistory,
    setAccessControls,
    setAccessHistory
  };
}
