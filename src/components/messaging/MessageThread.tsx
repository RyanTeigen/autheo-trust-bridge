
import React from 'react';
import { User, Paperclip } from 'lucide-react';
import { Message, Conversation } from './types';

interface MessageThreadProps {
  conversation: Conversation | undefined;
  isProviderView: boolean;
}

const MessageThread: React.FC<MessageThreadProps> = ({ 
  conversation,
  isProviderView
}) => {
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <User className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-300">No conversation selected</h3>
          <p className="text-slate-400 mt-1">Select a conversation from the list or start a new one</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="p-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-autheo-primary/20 flex items-center justify-center mr-3">
            <User className="h-5 w-5 text-autheo-primary" />
          </div>
          <div>
            <h3 className="font-medium text-autheo-primary">{conversation.participantName}</h3>
            <p className="text-xs text-slate-400">
              {conversation.participantTitle || (
                conversation.participantRole === 'patient' ? 'Patient' : 'Provider'
              )}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            isCurrentUser={message.sender === (isProviderView ? 'provider' : 'patient')} 
          />
        ))}
      </div>
    </>
  );
};

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-lg p-3 ${
          isCurrentUser
            ? 'bg-autheo-primary/20 text-slate-100'
            : 'bg-slate-700/50 text-slate-100'
        }`}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium text-sm">
            {message.senderName}
          </span>
          <span className="text-xs text-slate-400">
            {message.timestamp}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-1 p-1 bg-slate-900/30 rounded text-xs">
                <Paperclip className="h-3 w-3 text-slate-400" />
                <span className="truncate">{attachment.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageThread;
