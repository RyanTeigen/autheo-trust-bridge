
import React from 'react';
import { MessageCircle } from 'lucide-react';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import MessageComposer from './MessageComposer';
import { useMessaging } from './useMessaging';
import { SecureMessagingProps } from './types';

const SecureMessaging: React.FC<SecureMessagingProps> = ({ isProviderView = false }) => {
  const {
    conversations,
    activeConversationId,
    activeConversation,
    newMessage,
    searchQuery,
    attachments,
    setSearchQuery,
    setNewMessage,
    handleSendMessage,
    handleAttachmentUpload,
    removeAttachment,
    handleOpenConversation,
    handleStartNewConversation
  } = useMessaging(isProviderView);
  
  return (
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
  );
};

export default SecureMessaging;
