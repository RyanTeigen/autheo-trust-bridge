
import React from 'react';
import { MessageCircle, Shield, Clock, BarChart2, Users } from 'lucide-react';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import MessageComposer from './MessageComposer';
import { useRealTimeMessaging } from '@/hooks/useRealTimeMessaging';
import { SecureMessagingProps } from './types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SecureMessaging: React.FC<SecureMessagingProps> = ({ isProviderView = false }) => {
  const {
    conversations,
    activeConversationId,
    activeConversation,
    newMessage,
    setNewMessage,
    attachments,
    loading,
    setActiveConversationId,
    sendMessage,
    handleAttachmentUpload,
    removeAttachment,
    markMessagesAsRead
  } = useRealTimeMessaging(isProviderView);

  // Add missing state for search functionality
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter conversations by search query
  const filteredConversations = conversations.filter(conversation =>
    (conversation.participant_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conversation.messages?.[conversation.messages.length - 1]?.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Convert to legacy Conversation type for existing components
  const legacyConversations = filteredConversations.map(conv => ({
    id: conv.id,
    participantName: conv.participant_name || 'Unknown',
    participantRole: conv.participant_role || 'patient',
    participantTitle: conv.participant_role === 'provider' ? 'Dr.' : undefined,
    lastMessage: conv.messages?.[conv.messages.length - 1]?.content || 'No messages',
    lastMessageTime: conv.last_message_at ? new Date(conv.last_message_at).toLocaleString() : '',
    unread: conv.unread_count || 0,
    messages: conv.messages?.map(msg => ({
      id: msg.id,
      sender: msg.sender_type,
      senderName: msg.sender_name || (msg.sender_type === 'provider' ? 'Dr. Provider' : 'Patient'),
      content: msg.content,
      timestamp: msg.created_at,
      read: msg.is_read,
      attachments: msg.attachments?.map(att => ({
        name: att.file_name,
        type: att.file_type,
        url: att.file_url
      }))
    })) || []
  }));

  // Find active conversation in legacy format
  const legacyActiveConversation = legacyConversations.find(c => c.id === activeConversationId);

  // Mock analytics for now - in a real app, this would come from analytics service
  const messageMetrics = {
    responseTime: 15,
    engagementRate: 87,
    totalSent: conversations.reduce((acc, conv) => acc + (conv.messages?.length || 0), 0)
  };

  const handleOpenConversation = (id: string) => {
    setActiveConversationId(id);
    markMessagesAsRead(id);
  };

  const handleStartNewConversation = () => {
    // This would open a modal to select a patient/provider in a real app
    console.log('Start new conversation');
  };
  
  console.log("SecureMessaging - activeConversationId:", activeConversationId);
  console.log("SecureMessaging - activeConversation:", activeConversation);
  console.log("SecureMessaging - total conversations:", conversations.length);
  
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
          conversations={legacyConversations}
          searchQuery={searchQuery}
          activeConversationId={activeConversationId}
          onSearchChange={setSearchQuery}
          onConversationSelect={handleOpenConversation}
          onNewConversation={handleStartNewConversation}
        />
        
        {/* Active Conversation */}
        <div className="md:col-span-2 flex flex-col h-full">
          {legacyActiveConversation ? (
            <>
              <MessageThread 
                conversation={legacyActiveConversation}
                isProviderView={isProviderView}
              />
              
              <MessageComposer 
                newMessage={newMessage}
                attachments={attachments}
                onMessageChange={setNewMessage}
                onSendMessage={sendMessage}
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
