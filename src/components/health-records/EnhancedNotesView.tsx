
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText, Shield, Clock, Calendar, Eye, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PatientNoteViewer from '@/components/patient-dashboard/PatientNoteViewer';
import NoteAccessManager from '@/components/patient-dashboard/NoteAccessManager';

interface NoteData {
  id: string;
  visit_date: string;
  provider_id: string;
  provider_name: string;
  subjective: string;
  decentralized_refs?: any;
  distribution_status?: string;
  created_at: string;
}

interface EnhancedNotesViewProps {
  selectedNote?: string;
  notes: NoteData[];
  onSelectNote: (noteId: string) => void;
}

const EnhancedNotesView: React.FC<EnhancedNotesViewProps> = ({ 
  selectedNote, 
  notes = [], 
  onSelectNote 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'access'>('details');
  
  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>Please log in to view your medical notes.</p>
          <Button className="mt-4" onClick={() => navigate('/auth')}>
            Log In
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medical Notes</CardTitle>
              <CardDescription>
                Select a note to view details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {notes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
                    <p>No medical notes available</p>
                  </div>
                ) : (
                  notes.map(note => (
                    <div 
                      key={note.id}
                      className={`flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 border-b last:border-0 ${selectedNote === note.id ? 'bg-slate-100' : ''}`}
                      onClick={() => onSelectNote(note.id)}
                    >
                      <div className="flex items-center">
                        <div className="bg-blue-50 p-2 rounded-full">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-sm">
                            {new Date(note.visit_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Dr. {note.provider_name || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {note.decentralized_refs && (
                          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700">
                            <Shield className="h-3 w-3 mr-1" /> Secure
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Note Details and Access Control */}
        <div className="md:col-span-2">
          {selectedNote ? (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'details' | 'access')}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="details" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Note Details
                  </TabsTrigger>
                  <TabsTrigger value="access" className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> Provider Access
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="details" className="mt-0">
                <PatientNoteViewer noteId={selectedNote} />
              </TabsContent>
              
              <TabsContent value="access" className="mt-0">
                <NoteAccessManager noteId={selectedNote} />
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Note Selected</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Please select a medical note from the list to view details and manage provider access
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedNotesView;
