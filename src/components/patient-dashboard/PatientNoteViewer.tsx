
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Unlock, Clock, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PatientNoteViewerProps {
  noteId?: string;
}

interface NoteAccessControl {
  id: string;
  provider_id: string;
  provider_name: string;
  access_level: 'full' | 'temporary' | 'revoked';
  granted_at: string;
  expires_at: string | null;
}

const PatientNoteViewer: React.FC<PatientNoteViewerProps> = ({ noteId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [note, setNote] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessControls, setAccessControls] = useState<NoteAccessControl[]>([]);
  
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
        
        setAccessControls(accessData || []);
        
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
      const newAccessLevel = currentAccess === 'full' ? 'revoked' : 'full';
      
      // Update or create access control
      const { error } = await supabase
        .from('note_access_controls')
        .upsert({
          note_id: note.id,
          patient_id: user.id,
          provider_id: providerId,
          access_level: newAccessLevel,
          granted_at: new Date().toISOString(),
          expires_at: newAccessLevel === 'revoked' ? new Date().toISOString() : null
        }, { onConflict: 'note_id,provider_id' });
        
      if (error) throw error;
      
      // Update local state
      const updatedControls = accessControls.map(control => 
        control.provider_id === providerId 
          ? { ...control, access_level: newAccessLevel, expires_at: newAccessLevel === 'revoked' ? new Date().toISOString() : null }
          : control
      );
      
      setAccessControls(updatedControls);
      
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
  
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading note details...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!note) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
            <p>Note not found or you don't have permission to view it.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Find provider in access controls
  const providerAccess = accessControls.find(control => control.provider_id === note.provider_id);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Medical Note</CardTitle>
            <CardDescription>
              Visit Date: {new Date(note.visit_date).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {note.decentralized_refs && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <Shield className="h-3.5 w-3.5 mr-1" /> Decentralized
              </Badge>
            )}
            {note.distribution_status === 'distributed' ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Distributed
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Clock className="h-3.5 w-3.5 mr-1" /> Pending Distribution
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Provider Access Control */}
        <div className="border rounded-md p-4 bg-slate-50 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2 text-blue-600" /> Provider Access
            </h3>
            {providerAccess ? (
              providerAccess.access_level === 'full' ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer" onClick={() => handleToggleAccess(note.provider_id, 'full')}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> Full Access
                </Badge>
              ) : providerAccess.access_level === 'temporary' ? (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer" onClick={() => handleToggleAccess(note.provider_id, 'temporary')}>
                  <Clock className="h-3.5 w-3.5 mr-1" /> Temporary Access
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200 transition-colors cursor-pointer" onClick={() => handleToggleAccess(note.provider_id, 'revoked')}>
                  <EyeOff className="h-3.5 w-3.5 mr-1" /> Access Revoked
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="bg-amber-100 text-amber-800">
                <Clock className="h-3.5 w-3.5 mr-1" /> Status Unknown
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Control who can access this medical record and for how long.
          </p>
          
          <div className="flex justify-end">
            <Button 
              size="sm" 
              variant={providerAccess?.access_level === 'full' ? 'destructive' : 'default'}
              onClick={() => handleToggleAccess(note.provider_id, providerAccess?.access_level || 'revoked')}
            >
              {providerAccess?.access_level === 'full' ? (
                <><Lock className="h-4 w-4 mr-1" /> Revoke Access</>
              ) : (
                <><Unlock className="h-4 w-4 mr-1" /> Grant Access</>
              )}
            </Button>
          </div>
        </div>
      
        {/* Note Content */}
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Subjective</h3>
            <p className="whitespace-pre-wrap">{note.subjective}</p>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Objective</h3>
            <p className="whitespace-pre-wrap">{note.objective}</p>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Assessment</h3>
            <p className="whitespace-pre-wrap">{note.assessment}</p>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Plan</h3>
            <p className="whitespace-pre-wrap">{note.plan}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientNoteViewer;
