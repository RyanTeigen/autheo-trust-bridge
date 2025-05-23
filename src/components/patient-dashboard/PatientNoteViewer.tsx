
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AccessLevel, NoteAccessControl, AuditLogEntry, SoapNote } from './types/note';

// Import the smaller component parts
import NoteViewerSkeleton from './note-viewer/NoteViewerSkeleton';
import NoteHeader from './note-viewer/NoteHeader';
import AccessControlPanel from './note-viewer/AccessControlPanel';
import NoteContent from './note-viewer/NoteContent';
import NoteFooter from './note-viewer/NoteFooter';

interface PatientNoteViewerProps {
  noteId?: string;
}

const PatientNoteViewer: React.FC<PatientNoteViewerProps> = ({ noteId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [note, setNote] = useState<SoapNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessControls, setAccessControls] = useState<NoteAccessControl[]>([]);
  const [accessHistory, setAccessHistory] = useState<AuditLogEntry[]>([]);
  
  useEffect(() => {
    if (!noteId || !user?.id) return;
    
    const fetchNote = async () => {
      setLoading(true);
      try {
        // Fetch the note
        const { data, error } = await supabase
          .from('soap_notes')
          .select('*, profiles:provider_id(first_name, last_name)')
          .eq('id', noteId)
          .single();
          
        if (error) throw error;
        
        setNote(data);
        
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
  }, [noteId, user, toast]);
  
  const handleToggleAccess = async (providerId: string, currentAccess: string) => {
    if (!note || !user?.id) return;
    
    try {
      // Convert the string to AccessLevel type if needed
      const newAccessLevel = currentAccess === 'full' ? 'revoked' as AccessLevel : 'full' as AccessLevel;
      
      // Update or create access control
      const { error } = await supabase
        .from('note_access_controls')
        .upsert({
          note_id: note.id,
          patient_id: user.id,
          provider_id: providerId,
          provider_name: note.profiles?.first_name + ' ' + note.profiles?.last_name || 'Doctor',
          access_level: newAccessLevel,
          granted_at: new Date().toISOString(),
          expires_at: newAccessLevel === 'revoked' ? new Date().toISOString() : null
        }, { onConflict: 'note_id,provider_id' });
        
      if (error) throw error;
      
      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: newAccessLevel === 'full' ? 'grant_access' : 'revoke_access',
          resource: 'note_access',
          resource_id: noteId,
          details: `${newAccessLevel === 'full' ? 'Granted' : 'Revoked'} access to provider ${providerId}`,
          status: 'success'
        });
        
      // Update local state with proper type casting
      const updatedControls = accessControls.map(control => 
        control.provider_id === providerId 
          ? { ...control, access_level: newAccessLevel, expires_at: newAccessLevel === 'revoked' ? new Date().toISOString() : null }
          : control
      );
      
      setAccessControls(updatedControls);
      
      // Update access history
      const newHistoryEntry = {
        id: crypto.randomUUID(),
        user_id: user.id,
        timestamp: new Date().toISOString(),
        action: newAccessLevel === 'full' ? 'grant_access' : 'revoke_access',
        resource: 'note_access',
        resource_id: noteId || '',
        details: `${newAccessLevel === 'full' ? 'Granted' : 'Revoked'} access to provider ${providerId}`,
        status: 'success'
      };
      
      setAccessHistory([newHistoryEntry, ...accessHistory]);
      
      toast({
        title: newAccessLevel === 'full' ? "Access Granted" : "Access Revoked",
        description: `Provider access has been ${newAccessLevel === 'full' ? 'granted' : 'revoked'}.`,
      });
      
    } catch (err) {
      console.error("Error updating access control:", err);
      toast({
        title: "Error",
        description: "Failed to update access control",
        variant: "destructive",
      });
    }
  };
  
  // Show loading or error states
  if (loading) {
    return <NoteViewerSkeleton loading />;
  }
  
  if (!note) {
    return <NoteViewerSkeleton error="Note not found or you don't have permission to view it." />;
  }
  
  // Find provider in access controls
  const providerAccess = accessControls.find(control => control.provider_id === note?.provider_id);
  
  return (
    <Card>
      <CardHeader>
        <NoteHeader note={note} />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Provider Access Control */}
        <AccessControlPanel 
          noteId={note.id}
          providerId={note.provider_id}
          providerAccess={providerAccess}
          accessHistory={accessHistory}
          onToggleAccess={handleToggleAccess}
        />
      
        {/* Note Content */}
        <NoteContent note={note} />
      </CardContent>
      
      <NoteFooter note={note} />
    </Card>
  );
};

export default PatientNoteViewer;
