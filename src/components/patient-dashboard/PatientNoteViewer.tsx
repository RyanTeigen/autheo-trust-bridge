
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Unlock, Clock, Shield, AlertCircle, Eye, EyeOff, Calendar, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NoteAccessControl, AccessLevel } from '@/components/emr/soap-note/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PatientNoteViewerProps {
  noteId?: string;
}

const PatientNoteViewer: React.FC<PatientNoteViewerProps> = ({ noteId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [note, setNote] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessControls, setAccessControls] = useState<NoteAccessControl[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [accessHistory, setAccessHistory] = useState<any[]>([]);
  
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
  
  const handleToggleAccess = async (providerId: string, currentAccess: AccessLevel | string) => {
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
        resource_id: noteId,
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
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
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
  const providerAccess = accessControls.find(control => control.provider_id === note?.provider_id);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Medical Note</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Visit Date: {note && new Date(note.visit_date).toLocaleDateString()}
              </div>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {note?.decentralized_refs && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <Shield className="h-3.5 w-3.5 mr-1" /> Decentralized
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">This note is secured using decentralized encryption</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {note?.distribution_status === 'distributed' ? (
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
            <div className="flex gap-2">
              {providerAccess ? (
                providerAccess.access_level === 'full' ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer" onClick={() => handleToggleAccess(note.provider_id, providerAccess.access_level)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> Full Access
                  </Badge>
                ) : providerAccess.access_level === 'temporary' ? (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer" onClick={() => handleToggleAccess(note.provider_id, providerAccess.access_level)}>
                    <Clock className="h-3.5 w-3.5 mr-1" /> Temporary Access
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200 transition-colors cursor-pointer" onClick={() => handleToggleAccess(note.provider_id, providerAccess.access_level)}>
                    <EyeOff className="h-3.5 w-3.5 mr-1" /> Access Revoked
                  </Badge>
                )
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  <Clock className="h-3.5 w-3.5 mr-1" /> Status Unknown
                </Badge>
              )}
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? "Hide History" : "View History"}
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Control who can access this medical record and for how long.
          </p>
          
          {/* Access History */}
          {showHistory && accessHistory.length > 0 && (
            <div className="mt-4 border rounded-md p-3 bg-white">
              <h4 className="font-medium text-sm mb-2">Access History</h4>
              <div className="space-y-2 max-h-[120px] overflow-y-auto text-xs">
                {accessHistory.map((entry) => (
                  <div key={entry.id} className="flex justify-between border-b pb-1 last:border-0">
                    <div>
                      {entry.action === 'grant_access' ? (
                        <span className="text-green-600">✓ Access granted</span>
                      ) : (
                        <span className="text-red-600">✗ Access revoked</span>
                      )}
                    </div>
                    <div className="text-slate-500">
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
            <p className="whitespace-pre-wrap">{note?.subjective}</p>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Objective</h3>
            <p className="whitespace-pre-wrap">{note?.objective}</p>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Assessment</h3>
            <p className="whitespace-pre-wrap">{note?.assessment}</p>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Plan</h3>
            <p className="whitespace-pre-wrap">{note?.plan}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 text-xs text-slate-500">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-autheo-primary" />
            {note?.decentralized_refs ? 'Secured with decentralized encryption' : 'Standard encryption'}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Last updated: {new Date(note?.updated_at).toLocaleString()}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PatientNoteViewer;
