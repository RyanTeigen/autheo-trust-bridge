
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';
import { Conversation } from './types';

interface ConversationListProps {
  conversations: Conversation[];
  searchQuery: string;
  activeConversationId: string;
  onSearchChange: (query: string) => void;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  searchQuery,
  activeConversationId,
  onSearchChange,
  onConversationSelect,
  onNewConversation
}) => {
  return (
    <div className="border-r border-slate-700 md:col-span-1 flex flex-col h-full">
      <div className="p-3 border-b border-slate-700">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-slate-900/50 border-slate-700 text-slate-100"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`w-full text-left p-3 hover:bg-slate-900/50 transition-colors ${
                  conversation.id === activeConversationId ? 'bg-slate-900/70' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-autheo-primary">{conversation.participantName}</p>
                    <p className="text-xs text-slate-400">{conversation.participantTitle || (
                      conversation.participantRole === 'patient' ? 'Patient' : 'Provider'
                    )}</p>
                    <p className="text-sm truncate mt-1 text-slate-300">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400">{conversation.lastMessageTime}</span>
                    {conversation.unread > 0 && (
                      <Badge className="mt-1 bg-autheo-primary text-autheo-dark">{conversation.unread}</Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-slate-400">No conversations found</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-slate-700 mt-auto">
        <Button 
          className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
          onClick={onNewConversation}
        >
          <Plus className="h-4 w-4 mr-1" /> New Conversation
        </Button>
      </div>
    </div>
  );
};

export default ConversationList;
