
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/dashboard/PageHeader';
import SecureMessaging from '@/components/messaging/SecureMessaging';
import ProviderAccessRequest from '@/components/provider-access/ProviderAccessRequest';
import PatientAccessManagement from '@/components/provider-access/PatientAccessManagement';
import ProviderVerification from '@/components/provider-access/ProviderVerification';
import { FileText, MessageSquare, Shield, UserCheck } from 'lucide-react';

const ProviderAccess: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('accessManagement');
  const [userRole, setUserRole] = useState<'patient' | 'provider'>('patient'); // In a real app this would come from auth
  
  const handleRoleToggle = () => {
    // This is just for demo purposes - in a real app, roles would be determined by authentication
    setUserRole(userRole === 'patient' ? 'provider' : 'patient');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Provider Access"
          description={`Manage secure healthcare provider ${userRole === 'patient' ? 'relationships' : 'access to patient records'}`}
        />
        
        {/* Demo-only role switcher */}
        <button 
          onClick={handleRoleToggle} 
          className="text-sm px-3 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"
        >
          Switch to {userRole === 'patient' ? 'Provider' : 'Patient'} View
        </button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-b border-slate-700">
          {userRole === 'patient' ? (
            <>
              <TabsTrigger 
                value="accessManagement" 
                className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
              >
                <Shield className="h-4 w-4 mr-1.5" /> Access Management
              </TabsTrigger>
              <TabsTrigger 
                value="secureMessaging" 
                className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
              >
                <MessageSquare className="h-4 w-4 mr-1.5" /> Secure Messaging
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger 
                value="requestAccess" 
                className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
              >
                <FileText className="h-4 w-4 mr-1.5" /> Request Access
              </TabsTrigger>
              <TabsTrigger 
                value="verification" 
                className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
              >
                <UserCheck className="h-4 w-4 mr-1.5" /> Verification
              </TabsTrigger>
              <TabsTrigger 
                value="secureMessaging" 
                className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark"
              >
                <MessageSquare className="h-4 w-4 mr-1.5" /> Secure Messaging
              </TabsTrigger>
            </>
          )}
        </TabsList>
        
        {/* Patient view content */}
        {userRole === 'patient' && (
          <>
            <TabsContent value="accessManagement" className="mt-6">
              <PatientAccessManagement />
            </TabsContent>
            
            <TabsContent value="secureMessaging" className="mt-6">
              <SecureMessaging />
            </TabsContent>
          </>
        )}
        
        {/* Provider view content */}
        {userRole === 'provider' && (
          <>
            <TabsContent value="requestAccess" className="mt-6">
              <ProviderAccessRequest />
            </TabsContent>
            
            <TabsContent value="verification" className="mt-6">
              <ProviderVerification />
            </TabsContent>
            
            <TabsContent value="secureMessaging" className="mt-6">
              <SecureMessaging isProviderView={true} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ProviderAccess;
