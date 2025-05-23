
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Shield, Check, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { NoteAccessControl, AccessLevel } from '@/components/emr/soap-note/types';

interface NoteAccessManagerProps {
  noteId?: string;
}

const NoteAccessManager: React.FC<NoteAccessManagerProps> = ({ noteId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [providersWithAccess, setProvidersWithAccess] = useState<NoteAccessControl[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableProviders, setAvailableProviders] = useState<any[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!noteId || !user?.id) return;
    
    const fetchAccessData = async () => {
      setLoading(true);
      try {
        // Fetch current access controls
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
        
        setProvidersWithAccess(transformedAccessData);
        
        // Fetch available providers (excluding those who already have access)
        const { data: providersData, error: providersError } = await supabase
          .from('providers')
          .select('*, profiles:id(first_name, last_name)');
          
        if (providersError) throw providersError;
        
        if (providersData) {
          // Filter out providers who already have access
          const providerIdsWithAccess = transformedAccessData.map(access => access.provider_id);
          const availableProvidersFiltered = providersData.filter(
            provider => !providerIdsWithAccess.includes(provider.id)
          );
          
          setAvailableProviders(availableProvidersFiltered);
          setFilteredProviders(availableProvidersFiltered);
        }
        
      } catch (err) {
        console.error("Error fetching access data:", err);
        toast({
          title: "Error",
          description: "Could not load provider access data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccessData();
  }, [noteId, user, toast]);
  
  useEffect(() => {
    // Filter providers based on search query
    if (searchQuery) {
      const filtered = availableProviders.filter(provider => {
        const fullName = `${provider.profiles?.first_name || ''} ${provider.profiles?.last_name || ''}`.toLowerCase();
        const specialty = (provider.specialty || '').toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) || 
               specialty.includes(searchQuery.toLowerCase());
      });
      setFilteredProviders(filtered);
    } else {
      setFilteredProviders(availableProviders);
    }
  }, [searchQuery, availableProviders]);
  
  const handleGrantAccess = async (providerId: string, providerName: string) => {
    if (!noteId || !user?.id) return;
    
    try {
      const accessRecord = {
        note_id: noteId,
        patient_id: user.id,
        provider_id: providerId,
        provider_name: providerName,
        access_level: 'full' as AccessLevel,
        granted_at: new Date().toISOString(),
        expires_at: null
      };
      
      // Create access control record
      const { error } = await supabase
        .from('note_access_controls')
        .insert(accessRecord);
        
      if (error) throw error;
      
      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'grant_access',
          resource: 'note_access',
          resource_id: noteId,
          details: `Granted access to provider ${providerId} (${providerName})`,
          status: 'success'
        });
        
      // Update local state
      setProvidersWithAccess([...providersWithAccess, { ...accessRecord, id: crypto.randomUUID() }]);
      
      // Remove provider from available providers
      const updatedAvailableProviders = availableProviders.filter(p => p.id !== providerId);
      setAvailableProviders(updatedAvailableProviders);
      setFilteredProviders(updatedAvailableProviders);
      
      toast({
        title: "Access Granted",
        description: `Access granted to Dr. ${providerName}`,
      });
      
    } catch (err) {
      console.error("Error granting access:", err);
      toast({
        title: "Error",
        description: "Failed to grant access",
        variant: "destructive",
      });
    }
  };
  
  const handleRevokeAccess = async (accessControlId: string, providerId: string, providerName: string) => {
    if (!noteId || !user?.id) return;
    
    try {
      // Update access control record
      const { error } = await supabase
        .from('note_access_controls')
        .update({ 
          access_level: 'revoked' as AccessLevel,
          expires_at: new Date().toISOString()
        })
        .eq('id', accessControlId);
        
      if (error) throw error;
      
      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'revoke_access',
          resource: 'note_access',
          resource_id: noteId,
          details: `Revoked access from provider ${providerId} (${providerName})`,
          status: 'success'
        });
        
      // Update local state
      const updatedControls = providersWithAccess.map(control => 
        control.id === accessControlId
          ? { ...control, access_level: 'revoked' as AccessLevel, expires_at: new Date().toISOString() }
          : control
      );
      
      setProvidersWithAccess(updatedControls);
      
      toast({
        title: "Access Revoked",
        description: `Access revoked from Dr. ${providerName}`,
      });
      
    } catch (err) {
      console.error("Error revoking access:", err);
      toast({
        title: "Error",
        description: "Failed to revoke access",
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical Record Access</CardTitle>
        <CardDescription>
          Manage which healthcare providers can access this medical record
        </CardDescription>
        
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search providers by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Access List */}
        <div>
          <h3 className="text-sm font-medium mb-3">Providers With Access</h3>
          
          {providersWithAccess.length === 0 ? (
            <div className="text-center py-6 border rounded-md bg-slate-50">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No providers currently have access to this record</p>
            </div>
          ) : (
            <div className="space-y-2">
              {providersWithAccess.map((access) => (
                <div 
                  key={access.id} 
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50"
                >
                  <div>
                    <div className="font-medium">{access.provider_name}</div>
                    <div className="text-xs text-muted-foreground">
                      Granted: {formatDate(access.granted_at)}
                      {access.expires_at && ` • Expires: ${formatDate(access.expires_at)}`}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {access.access_level === 'full' ? (
                      <>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Check className="h-3.5 w-3.5 mr-1" /> Full Access
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8"
                          onClick={() => handleRevokeAccess(access.id, access.provider_id, access.provider_name)}
                        >
                          Revoke
                        </Button>
                      </>
                    ) : access.access_level === 'temporary' ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                        <Clock className="h-3.5 w-3.5 mr-1" /> Temporary
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                        Access Revoked
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Available Providers */}
        <div>
          <h3 className="text-sm font-medium mb-3">Available Providers</h3>
          
          {filteredProviders.length === 0 ? (
            <div className="text-center py-6 border rounded-md bg-slate-50">
              <p className="text-muted-foreground">
                {searchQuery ? "No providers match your search" : "No additional providers available"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProviders.slice(0, 5).map((provider) => {
                const fullName = `${provider.profiles?.first_name || ''} ${provider.profiles?.last_name || ''}`;
                
                return (
                  <div 
                    key={provider.id} 
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50"
                  >
                    <div>
                      <div className="font-medium">{fullName}</div>
                      {provider.specialty && (
                        <div className="text-xs text-muted-foreground">
                          Specialty: {provider.specialty}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8"
                      onClick={() => handleGrantAccess(provider.id, fullName)}
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1" /> Grant Access
                    </Button>
                  </div>
                );
              })}
              
              {filteredProviders.length > 5 && (
                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    + {filteredProviders.length - 5} more providers
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t">
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-1 text-autheo-primary" /> 
            Access changes are cryptographically tracked and audited
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteAccessManager;
