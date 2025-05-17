
import React, { useState, useEffect } from 'react';
import { FileText, Clipboard, Share, LockOpen, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AuditLogService } from '@/services/AuditLogService';
import { supabase } from '@/integrations/supabase/client';

interface SOAPNote {
  id: string;
  patient_id: string;
  provider_id: string;
  visit_date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  share_with_patient: boolean;
  created_at: string;
  updated_at: string;
  // Additional fields for UI display
  patientName?: string;
  providerName?: string;
}

const RecentNotesList = () => {
  const [notes, setNotes] = useState<SOAPNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<SOAPNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        
        // Get current authenticated user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("You must be logged in to view notes");
          return;
        }

        // Fetch SOAP notes from Supabase
        const { data: notesData, error: notesError } = await supabase
          .from('soap_notes')
          .select('*')
          .order('created_at', { ascending: false });

        if (notesError) {
          throw notesError;
        }

        // For each note, fetch the patient and provider names
        const notesWithNames = await Promise.all(notesData.map(async (note) => {
          // This is a simplified approach - in a real app, you would join tables in the query
          return {
            ...note,
            patientName: `Patient ${note.patient_id.substring(0, 8)}`, // Placeholder
            providerName: "Dr. Sarah Johnson" // Placeholder
          };
        }));

        setNotes(notesWithNames);
        
        // Log audit event for viewing notes list
        AuditLogService.logAdminAction(
          'Viewed clinical notes list',
          'Medical Notes',
          'success'
        );
        
        // Also log to Supabase audit logs
        await supabase.from('audit_logs')
          .insert({
            user_id: session.user.id,
            action: 'Viewed clinical notes list',
            resource: 'Medical Notes',
            status: 'success'
          });

      } catch (err) {
        console.error("Error fetching notes:", err);
        setError("Failed to fetch notes");
        toast({
          title: "Error",
          description: "Failed to load clinical notes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [toast]);

  const handleViewNote = async (note: SOAPNote) => {
    setSelectedNote(note);
    
    try {
      // Get current authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Log the access for HIPAA compliance
      AuditLogService.logPatientAccess(
        note.patient_id,
        note.patientName || `Patient ${note.patient_id.substring(0, 8)}`,
        'Viewed SOAP note',
        'success',
        'Provider viewed clinical documentation'
      );
      
      // Also log to Supabase audit logs
      await supabase.from('audit_logs')
        .insert({
          user_id: session.user.id,
          action: 'Viewed SOAP note',
          resource: `Patient: ${note.patientName || note.patient_id}`,
          resource_id: note.patient_id,
          status: 'success',
          details: 'Provider viewed clinical documentation'
        });
    } catch (err) {
      console.error("Error logging note access:", err);
    }
  };

  const handleToggleShare = async (note: SOAPNote) => {
    try {
      // Update sharing status in Supabase
      const { error } = await supabase
        .from('soap_notes')
        .update({ share_with_patient: !note.share_with_patient })
        .eq('id', note.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedNotes = notes.map(n => 
        n.id === note.id ? { ...n, share_with_patient: !n.share_with_patient } : n
      );
      
      setNotes(updatedNotes);
      
      // If currently viewing this note, update selected note
      if (selectedNote && selectedNote.id === note.id) {
        setSelectedNote({ ...selectedNote, share_with_patient: !selectedNote.share_with_patient });
      }
      
      // Get current authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Log the sharing action
      AuditLogService.logPatientAccess(
        note.patient_id,
        note.patientName || `Patient ${note.patient_id.substring(0, 8)}`,
        note.share_with_patient ? 'Revoked note sharing' : 'Shared note with patient',
        'success',
        note.share_with_patient 
          ? 'Provider revoked patient access to note' 
          : 'Provider granted patient access to note'
      );
      
      // Also log to Supabase audit logs
      await supabase.from('audit_logs')
        .insert({
          user_id: session.user.id,
          action: note.share_with_patient ? 'Revoked note sharing' : 'Shared note with patient',
          resource: `Patient: ${note.patientName || note.patient_id}`,
          resource_id: note.patient_id,
          status: 'success',
          details: note.share_with_patient 
            ? 'Provider revoked patient access to note' 
            : 'Provider granted patient access to note'
        });
      
      toast({
        title: note.share_with_patient ? "Note Access Revoked" : "Note Shared",
        description: note.share_with_patient 
          ? `This note is no longer accessible to the patient` 
          : `This note is now visible to the patient`,
      });
    } catch (err) {
      console.error("Error toggling share status:", err);
      toast({
        title: "Error",
        description: "Failed to update sharing status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading clinical notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">No clinical notes yet</h3>
        <p className="text-muted-foreground mt-1">
          Create your first SOAP note to see it listed here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedNote ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setSelectedNote(null)}>
              Back to List
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant={selectedNote.share_with_patient ? "default" : "outline"}>
                {selectedNote.share_with_patient ? "Shared with Patient" : "Provider Only"}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleToggleShare(selectedNote)}
              >
                {selectedNote.share_with_patient ? (
                  <><Lock className="h-4 w-4 mr-1" /> Revoke Access</>
                ) : (
                  <><LockOpen className="h-4 w-4 mr-1" /> Share with Patient</>
                )}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Patient:</span> {selectedNote.patientName || selectedNote.patient_id}
            </div>
            <div>
              <span className="font-medium">Date:</span> {new Date(selectedNote.visit_date).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Provider:</span> {selectedNote.providerName || selectedNote.provider_id}
            </div>
            <div>
              <span className="font-medium">Created:</span> {new Date(selectedNote.created_at).toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-4 mt-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Subjective</h3>
              <p className="whitespace-pre-wrap">{selectedNote.subjective}</p>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Objective</h3>
              <p className="whitespace-pre-wrap">{selectedNote.objective}</p>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Assessment</h3>
              <p className="whitespace-pre-wrap">{selectedNote.assessment}</p>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Plan</h3>
              <p className="whitespace-pre-wrap">{selectedNote.plan}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div 
              key={note.id} 
              className="flex items-center justify-between p-4 border rounded-md hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="bg-muted h-10 w-10 rounded-full flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{note.patientName || `Patient ${note.patient_id.substring(0, 8)}`}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(note.visit_date).toLocaleDateString()} - {note.providerName || "Dr. Provider"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {note.share_with_patient ? (
                  <Badge>Shared</Badge>
                ) : (
                  <Badge variant="outline">Private</Badge>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewNote(note)}
                >
                  <Clipboard className="h-4 w-4 mr-1" /> View
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleToggleShare(note)}
                >
                  {note.share_with_patient ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Share className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentNotesList;
