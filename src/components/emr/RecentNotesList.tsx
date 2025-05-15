
import React, { useState, useEffect } from 'react';
import { FileText, Clipboard, Share, LockOpen, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AuditLogService } from '@/services/AuditLogService';

interface SOAPNote {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  providerName: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  shareWithPatient: boolean;
  createdAt: string;
}

const RecentNotesList = () => {
  const [notes, setNotes] = useState<SOAPNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<SOAPNote | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved notes from localStorage
    const savedNotes = JSON.parse(localStorage.getItem('soapNotes') || '[]');
    setNotes(savedNotes);
    
    // Log audit event for viewing notes list
    AuditLogService.logAdminAction(
      'Viewed clinical notes list',
      'Medical Notes',
      'success'
    );
  }, []);

  const handleViewNote = (note: SOAPNote) => {
    setSelectedNote(note);
    
    // Log the access for HIPAA compliance
    AuditLogService.logPatientAccess(
      note.patientId,
      note.patientName,
      'Viewed SOAP note',
      'success',
      'Provider viewed clinical documentation'
    );
  };

  const handleToggleShare = (note: SOAPNote) => {
    // Update sharing status
    const updatedNotes = notes.map(n => 
      n.id === note.id ? { ...n, shareWithPatient: !n.shareWithPatient } : n
    );
    
    setNotes(updatedNotes);
    localStorage.setItem('soapNotes', JSON.stringify(updatedNotes));
    
    // If currently viewing this note, update selected note
    if (selectedNote && selectedNote.id === note.id) {
      setSelectedNote({ ...selectedNote, shareWithPatient: !selectedNote.shareWithPatient });
    }
    
    // Log the sharing action
    AuditLogService.logPatientAccess(
      note.patientId,
      note.patientName,
      note.shareWithPatient ? 'Revoked note sharing' : 'Shared note with patient',
      'success',
      note.shareWithPatient 
        ? 'Provider revoked patient access to note' 
        : 'Provider granted patient access to note'
    );
    
    toast({
      title: note.shareWithPatient ? "Note Access Revoked" : "Note Shared",
      description: note.shareWithPatient 
        ? `This note is no longer accessible to ${note.patientName}` 
        : `This note is now visible to ${note.patientName}`,
    });
  };

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
              <Badge variant={selectedNote.shareWithPatient ? "default" : "outline"}>
                {selectedNote.shareWithPatient ? "Shared with Patient" : "Provider Only"}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleToggleShare(selectedNote)}
              >
                {selectedNote.shareWithPatient ? (
                  <><Lock className="h-4 w-4 mr-1" /> Revoke Access</>
                ) : (
                  <><LockOpen className="h-4 w-4 mr-1" /> Share with Patient</>
                )}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Patient:</span> {selectedNote.patientName} ({selectedNote.patientId})</div>
            <div><span className="font-medium">Date:</span> {new Date(selectedNote.visitDate).toLocaleDateString()}</div>
            <div><span className="font-medium">Provider:</span> {selectedNote.providerName}</div>
            <div><span className="font-medium">Created:</span> {new Date(selectedNote.createdAt).toLocaleString()}</div>
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
                  <p className="font-medium">{note.patientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(note.visitDate).toLocaleDateString()} - {note.providerName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {note.shareWithPatient ? (
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
                  {note.shareWithPatient ? (
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
