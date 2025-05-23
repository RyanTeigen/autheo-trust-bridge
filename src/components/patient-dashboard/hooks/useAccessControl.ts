
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AccessLevel, NoteAccessControl, AuditLogEntry, SoapNote } from '../types/note';

export function useAccessControl(
  userId: string | undefined,
  noteId: string | undefined,
  accessControls: NoteAccessControl[],
  accessHistory: AuditLogEntry[],
  setAccessControls: React.Dispatch<React.SetStateAction<NoteAccessControl[]>>,
  setAccessHistory: React.Dispatch<React.SetStateAction<AuditLogEntry[]>>
) {
  const { toast } = useToast();
  
  const handleToggleAccess = async (providerId: string, currentAccess: string, note: SoapNote | null) => {
    if (!note || !userId) return;
    
    try {
      // Convert the string to AccessLevel type if needed
      const newAccessLevel = currentAccess === 'full' ? 'revoked' as AccessLevel : 'full' as AccessLevel;
      
      // Update or create access control
      const { error } = await supabase
        .from('note_access_controls')
        .upsert({
          note_id: note.id,
          patient_id: userId,
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
          user_id: userId,
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
      const newHistoryEntry: AuditLogEntry = {
        id: crypto.randomUUID(),
        user_id: userId,
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
  
  return { handleToggleAccess };
}
