
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { NoteAccessControl } from './types/note';

// Import hooks
import { useNoteData } from './hooks/useNoteData';
import { useAccessControl } from './hooks/useAccessControl';

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
  const { user } = useAuth();
  const { 
    note, 
    loading, 
    accessControls, 
    accessHistory,
    setAccessControls,
    setAccessHistory
  } = useNoteData(noteId, user?.id);
  
  const { handleToggleAccess } = useAccessControl(
    user?.id, 
    noteId, 
    accessControls, 
    accessHistory, 
    setAccessControls,
    setAccessHistory
  );
  
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
          onToggleAccess={(providerId, currentAccess) => handleToggleAccess(providerId, currentAccess, note)}
        />
      
        {/* Note Content */}
        <NoteContent note={note} />
      </CardContent>
      
      <NoteFooter note={note} />
    </Card>
  );
};

export default PatientNoteViewer;
