import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'patient' | 'provider';
  sender_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender_name?: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  patient_id: string;
  provider_id: string;
  subject: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
  participant_name?: string;
  participant_role?: 'patient' | 'provider';
  unread_count?: number;
}

export const useRealTimeMessaging = (isProviderView: boolean = false) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages (
            id,
            conversation_id,
            content,
            sender_type,
            sender_id,
            message_type,
            is_read,
            read_at,
            created_at,
            updated_at,
            message_attachments (*)
          )
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get participant names
      const conversationsWithNames = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          let participantName = 'Unknown';
          let participantRole: 'patient' | 'provider' = 'patient';

          if (isProviderView) {
            // For providers, get patient name
            const { data: patientData } = await supabase
              .from('patients')
              .select('user_id, profiles!inner(first_name, last_name)')
              .eq('id', conv.patient_id)
              .single();

            if (patientData?.profiles) {
              const profile = Array.isArray(patientData.profiles) ? patientData.profiles[0] : patientData.profiles;
              participantName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
              participantRole = 'patient';
            }
          } else {
            // For patients, get provider name
            const { data: providerData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', conv.provider_id)
              .single();

            if (providerData) {
              participantName = `${providerData.first_name || ''} ${providerData.last_name || ''}`.trim();
              participantRole = 'provider';
            }
          }

          // Get current user for unread count
          const { data: { user } } = await supabase.auth.getUser();
          
          // Count unread messages
          const unreadCount = conv.messages?.filter((msg: any) => 
            !msg.is_read && msg.sender_id !== user?.id
          ).length || 0;

          return {
            ...conv,
            participant_name: participantName,
            participant_role: participantRole,
            unread_count: unreadCount,
            messages: (conv.messages || []).map((msg: any) => ({
              ...msg,
              sender_type: msg.sender_type as 'patient' | 'provider',
              attachments: msg.message_attachments || []
            }))
          };
        })
      );

      setConversations(conversationsWithNames);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [isProviderView, toast]);

  // Send message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    if (!activeConversationId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Determine sender type
      let senderType: 'patient' | 'provider' = 'patient';
      if (isProviderView) {
        senderType = 'provider';
      } else {
        // Check if user is a patient
        const { data: patientData } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (patientData) {
          senderType = 'patient';
        }
      }

      // Insert message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversationId,
          sender_type: senderType,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Handle attachments if any
      if (attachments.length > 0 && messageData) {
        const attachmentPromises = attachments.map(async (file) => {
          // In a real implementation, you'd upload the file to storage first
          // For now, we'll just store the file metadata
          return supabase
            .from('message_attachments')
            .insert({
              message_id: messageData.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size
            });
        });

        await Promise.all(attachmentPromises);
      }

      // Clear input and attachments
      setNewMessage('');
      setAttachments([]);

      // Refresh conversations
      await fetchConversations();

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  }, [newMessage, attachments, activeConversationId, isProviderView, fetchConversations, toast]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('mark_messages_as_read', {
        conversation_id_param: conversationId,
        user_id_param: user.id
      });

      // Refresh conversations to update unread counts
      await fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [fetchConversations]);

  // Handle attachment upload
  const handleAttachmentUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      // Basic security check for file types
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
      return allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Some files were rejected. Only images, PDFs, and text files under 10MB are allowed.",
        variant: "destructive"
      });
    }

    setAttachments(prev => [...prev, ...validFiles]);
  }, [toast]);

  // Remove attachment
  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchConversations();

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const conversationSubscription = supabase
      .channel('conversation-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
      supabase.removeChannel(conversationSubscription);
    };
  }, [fetchConversations]);

  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    newMessage,
    setNewMessage,
    attachments,
    loading,
    sendMessage,
    handleAttachmentUpload,
    removeAttachment,
    markMessagesAsRead
  };
};