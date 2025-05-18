import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Conversation, Message } from './types';
import { getMockPatientConversations, getMockProviderConversations } from './mockData';

export function useMessaging(isProviderView: boolean = false) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>(
    isProviderView ? getMockProviderConversations() : getMockPatientConversations()
  );
  // Set a default activeConversationId if conversations exist
  const [activeConversationId, setActiveConversationId] = useState<string>(
    conversations && conversations.length > 0 ? conversations[0].id : ''
  );
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  // Analytics metrics
  const [messageMetrics, setMessageMetrics] = useState({
    totalSent: 0,
    responseTime: 0,
    engagementRate: 0,
    securityAlerts: 0
  });
  
  useEffect(() => {
    // Ensure activeConversationId is set whenever conversations change
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
    
    // Update analytics
    if (conversations.length > 0) {
      calculateMessageMetrics();
    }
  }, [conversations]);
  
  // Filter conversations by search query
  const filteredConversations = conversations.filter(conversation =>
    conversation.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  // Calculate message analytics metrics
  const calculateMessageMetrics = () => {
    let totalMessages = 0;
    let totalResponseTime = 0;
    let responsePairs = 0;
    
    // Calculate metrics across all conversations
    conversations.forEach(convo => {
      totalMessages += convo.messages.length;
      
      // Calculate average response times between messages
      for (let i = 1; i < convo.messages.length; i++) {
        const prevMsg = convo.messages[i-1];
        const currMsg = convo.messages[i];
        
        if (prevMsg.sender !== currMsg.sender) {
          const prevTime = new Date(prevMsg.timestamp).getTime();
          const currTime = new Date(currMsg.timestamp).getTime();
          totalResponseTime += (currTime - prevTime);
          responsePairs++;
        }
      }
    });
    
    // Update metrics
    setMessageMetrics({
      totalSent: totalMessages,
      responseTime: responsePairs > 0 ? Math.round(totalResponseTime / responsePairs / 60000) : 0, // in minutes
      engagementRate: conversations.length > 0 ? 
        Math.round((conversations.filter(c => c.messages.length > 2).length / conversations.length) * 100) : 0,
      securityAlerts: 0 // This would come from a real monitoring system
    });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '' && attachments.length === 0) return;
    
    // Security check - in a real app, we'd scan for PHI patterns, sensitive data, etc.
    const containsSensitivePattern = /\b\d{3}-\d{2}-\d{4}\b|^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/.test(newMessage);
    
    if (containsSensitivePattern) {
      toast({
        title: "Security Alert",
        description: "Your message may contain sensitive information. Please review before sending.",
        variant: "destructive"
      });
      // In a real app, we might log this or prompt for encryption/redaction
    }
    
    const updatedConversations = conversations.map(conversation => {
      if (conversation.id === activeConversationId) {
        const newMsg: Message = {
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
    
    // Update analytics after sending
    setTimeout(calculateMessageMetrics, 100);
    
    toast({
      title: "Message sent",
      description: "Your secure message has been sent"
    });
    
    // Clinical workflow integration - suggest documenting in EHR if appropriate content
    if (isProviderView && newMessage.length > 100) {
      setTimeout(() => {
        toast({
          title: "Workflow Suggestion",
          description: "Consider documenting this clinical exchange in the patient's EHR"
        });
      }, 2000);
    }
  };
  
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Security check for attachment types
      const unsafeFileTypes = newFiles.filter(file => {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        return ['exe', 'bat', 'cmd', 'sh', 'js'].includes(fileExt || '');
      });
      
      if (unsafeFileTypes.length > 0) {
        toast({
          title: "Security Alert",
          description: "Potentially unsafe file type detected and blocked",
          variant: "destructive"
        });
        return;
      }
      
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
    // This is the key function for toggling between messages
    console.log("Opening conversation with ID:", id);
    setActiveConversationId(id);
    markConversationAsRead(id);
    
    // If this is a provider and there's clinical context, suggest actions
    if (isProviderView) {
      const conversation = conversations.find(c => c.id === id);
      const patientMessages = conversation?.messages.filter(m => m.sender === 'patient') || [];
      
      // Check for clinical patterns in recent messages (like symptom descriptions)
      const recentMessages = patientMessages.slice(-3);
      const hasMedicalTerms = recentMessages.some(msg => 
        /\b(pain|fever|symptoms|medication|treatment|diagnosis|allergy)\b/i.test(msg.content)
      );
      
      if (hasMedicalTerms) {
        setTimeout(() => {
          toast({
            title: "Clinical Context Detected",
            description: "Consider reviewing patient history before responding"
          });
        }, 1500);
      }
    }
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
    messageMetrics,
    setSearchQuery,
    setNewMessage,
    handleSendMessage,
    handleAttachmentUpload,
    removeAttachment,
    handleOpenConversation,
    handleStartNewConversation
  };
}
