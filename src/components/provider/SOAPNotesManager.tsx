import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText, Search, Calendar, User, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SOAPNoteForm from '@/components/emr/soap-note/SOAPNoteForm';
import LoadingStates from '@/components/ux/LoadingStates';

interface SOAPNote {
  id: string;
  patient_id: string;
  patient_name: string;
  provider_name: string;
  visit_date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  created_at: string;
  updated_at: string;
}

const SOAPNotesManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SOAPNote | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for now - in real implementation, this would fetch from the API
  const { data: notesData, isLoading } = useQuery({
    queryKey: ['soap-notes', searchTerm],
    queryFn: async () => {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockNotes: SOAPNote[] = [
        {
          id: '1',
          patient_id: 'patient-1',
          patient_name: 'John Doe',
          provider_name: 'Dr. Smith',
          visit_date: '2024-01-15',
          subjective: 'Patient reports chest pain for 2 days, describes as sharp, worse with deep breathing',
          objective: 'VS: BP 140/90, HR 88, RR 16, T 98.6°F. Heart sounds S1S2 regular, no murmur. Lungs clear bilaterally.',
          assessment: 'Chest pain, likely musculoskeletal origin. Rule out cardiac causes.',
          plan: 'ECG ordered, basic metabolic panel. Follow up in 3 days if symptoms persist.',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          patient_id: 'patient-2',
          patient_name: 'Jane Smith',
          provider_name: 'Dr. Johnson',
          visit_date: '2024-01-14',
          subjective: 'Annual wellness visit. No acute concerns. Patient reports feeling well.',
          objective: 'VS: BP 120/80, HR 72, RR 14, T 98.2°F. Physical exam unremarkable.',
          assessment: 'Healthy adult, annual wellness visit.',
          plan: 'Continue current medications. Routine labs ordered. Next visit in 1 year.',
          created_at: '2024-01-14T14:30:00Z',
          updated_at: '2024-01-14T14:30:00Z'
        }
      ];

      return {
        data: mockNotes.filter(note => 
          note.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.subjective.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        totalCount: mockNotes.length
      };
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: any) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, data: { id: Date.now().toString(), ...noteData } };
    },
    onSuccess: () => {
      toast({
        title: 'SOAP Note Created',
        description: 'The SOAP note has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['soap-notes'] });
      setShowCreateForm(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create SOAP note.',
        variant: 'destructive',
      });
    },
  });

  const notes = notesData?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">SOAP Notes</h2>
          <p className="text-muted-foreground">
            Manage patient encounter documentation
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New SOAP Note
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search SOAP notes by patient name or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Create Form Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create SOAP Note</DialogTitle>
            <DialogDescription>
              Document patient encounter using the SOAP format
            </DialogDescription>
          </DialogHeader>
          <SOAPNoteForm
            onSubmit={(data) => createNoteMutation.mutate(data)}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={createNoteMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Notes List */}
      {isLoading ? (
        <div className="flex justify-center">
          <LoadingStates type="healthcare" message="Loading SOAP notes..." />
        </div>
      ) : notes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No SOAP notes found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No notes match your search criteria' : 'Start by creating your first SOAP note'}
                </p>
              </div>
              {!searchTerm && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First SOAP Note
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {note.patient_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(note.visit_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(note.created_at)}
                      </span>
                      <span>Provider: {note.provider_name}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline">SOAP Note</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Subjective</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {note.subjective}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-1">Assessment</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {note.assessment}
                    </p>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedNote(note)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          View Full Note
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>SOAP Note - {note.patient_name}</DialogTitle>
                          <DialogDescription>
                            Visit Date: {formatDate(note.visit_date)} | Provider: {note.provider_name}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedNote && (
                          <div className="space-y-6 mt-4">
                            <div>
                              <h3 className="font-semibold text-lg mb-2">Subjective</h3>
                              <div className="bg-muted p-4 rounded-md">
                                <p className="text-sm">{selectedNote.subjective}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-lg mb-2">Objective</h3>
                              <div className="bg-muted p-4 rounded-md">
                                <p className="text-sm">{selectedNote.objective}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-lg mb-2">Assessment</h3>
                              <div className="bg-muted p-4 rounded-md">
                                <p className="text-sm">{selectedNote.assessment}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-lg mb-2">Plan</h3>
                              <div className="bg-muted p-4 rounded-md">
                                <p className="text-sm">{selectedNote.plan}</p>
                              </div>
                            </div>
                            
                            <div className="text-xs text-muted-foreground border-t pt-4">
                              Created: {formatDate(selectedNote.created_at)} at {formatTime(selectedNote.created_at)}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SOAPNotesManager;