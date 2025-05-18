
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Conversation } from './types';
import { getMockPatientConversations, getMockProviderConversations } from './mockData';

export function useMessaging(isProviderView: boolean = false) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>(
    isProviderView ? getMockProviderConversations() : getMockPatientConversations()
  );
  const [activeConversationId, setActiveConversationId] = useState<string>(conversations[0]?.id || '');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Filter conversations by search query
  const filteredConversations = conversations.filter(conversation =>
    conversation.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleSendMessage = () => {
    if (newMessage.trim() === '' && attachments.length === 0) return;
    
    const updatedConversations = conversations.map(conversation => {
      if (conversation.id === activeConversationId) {
        const newMsg = {
          id: `${conversation.id}-${conversation.messages.length + 1}`,
          sender: isProviderView ? 'provider' : 'patient',
          senderName: isProviderView ? 'You (Provider)' : 'You',
          content: newMessage.trim(),
          timestamp: new Date().toLocaleString(),
          read: true,
          attachments: attachments.length > 0 ? attachments.map(file => ({
            name: file.name,
            type: file.type
          })) : undefined
        };
        
        return {
          ...conversation,
          lastMessage: newMessage.trim(),
          lastMessageTime: 'Just now',
          messages: [...conversation.messages, newMsg]
        };
      }
      return conversation;
    });
    
    setConversations(updatedConversations);
    setNewMessage('');
    setAttachments([]);
    
    toast({
      title: "Message sent",
      description: "Your secure message has been sent"
    });
  };
  
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
      e.target.value = '';
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };
  
  const markConversationAsRead = (id: string) => {
    setConversations(
      conversations.map(conv => {
        if (conv.id === id) {
          return {
            ...conv,
            unread: 0,
            messages: conv.messages.map(msg => ({ ...msg, read: true }))
          };
        }
        return conv;
      })
    );
  };
  
  const handleOpenConversation = (id: string) => {
    setActiveConversationId(id);
    markConversationAsRead(id);
  };

  const handleStartNewConversation = () => {
    toast({
      title: "New conversation",
      description: isProviderView 
        ? "Select a patient to start a new conversation"
        : "Select a provider to start a new conversation"
    });
  };

  return {
    conversations: filteredConversations,
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
  };
}
