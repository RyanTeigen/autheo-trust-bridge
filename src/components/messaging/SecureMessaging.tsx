
import React from 'react';
import { MessageCircle, Shield, Clock, BarChart2, Users } from 'lucide-react';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import MessageComposer from './MessageComposer';
import { useMessaging } from './useMessaging';
import { SecureMessagingProps } from './types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SecureMessaging: React.FC<SecureMessagingProps> = ({ isProviderView = false }) => {
  const {
    conversations,
    activeConversationId,
    activeConversation,
    newMessage,
    searchQuery,
    attachments,
    messageMetrics,
    setSearchQuery,
    setNewMessage,
    handleSendMessage,
    handleAttachmentUpload,
    removeAttachment,
    handleOpenConversation,
    handleStartNewConversation
  } = useMessaging(isProviderView);
  
  return (
    <div className="space-y-4">
      {/* Analytics Header for Providers */}
      {isProviderView && (
        <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700 mb-4">
          <h3 className="text-sm font-medium text-slate-300 mr-2">Messaging Insights:</h3>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 rounded-full">
                  <Clock className="h-3.5 w-3.5 text-autheo-primary" />
                  <span className="text-xs text-slate-300">
                    {messageMetrics.responseTime} min avg response
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Average response time to patient messages</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 rounded-full">
                  <BarChart2 className="h-3.5 w-3.5 text-autheo-primary" />
                  <span className="text-xs text-slate-300">
                    {messageMetrics.engagementRate}% engagement rate
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Percentage of conversations with sustained engagement</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 rounded-full">
                  <Users className="h-3.5 w-3.5 text-autheo-primary" />
                  <span className="text-xs text-slate-300">
                    {conversations.length} active patients
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Number of patients with active conversations</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="ml-auto">
            <Badge variant="outline" className="bg-autheo-primary/20 text-autheo-primary border-autheo-primary/30">
              <Shield className="h-3.5 w-3.5 mr-1" /> HIPAA Compliant
            </Badge>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
        {/* Conversation List */}
        <ConversationList 
          conversations={conversations}
          searchQuery={searchQuery}
          activeConversationId={activeConversationId}
          onSearchChange={setSearchQuery}
          onConversationSelect={handleOpenConversation}
          onNewConversation={handleStartNewConversation}
        />
        
        {/* Active Conversation */}
        <div className="md:col-span-2 flex flex-col">
          {activeConversation ? (
            <>
              <MessageThread 
                conversation={activeConversation}
                isProviderView={isProviderView}
              />
              
              <MessageComposer 
                newMessage={newMessage}
                attachments={attachments}
                onMessageChange={setNewMessage}
                onSendMessage={handleSendMessage}
                onAttachmentUpload={handleAttachmentUpload}
                onRemoveAttachment={removeAttachment}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-300">No conversation selected</h3>
                <p className="text-slate-400 mt-1">Select a conversation from the list or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecureMessaging;
