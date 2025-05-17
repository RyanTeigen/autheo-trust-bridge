
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, User, Image, Paperclip, Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender: 'patient' | 'provider';
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: {
    name: string;
    type: string;
    url?: string;
  }[];
}

interface Conversation {
  id: string;
  providerName: string;
  providerTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: '1',
    providerName: 'Dr. Emily Chen',
    providerTitle: 'Primary Care',
    lastMessage: 'Your lab results look normal. No concerns at this time.',
    lastMessageTime: '2h ago',
    unread: 0,
    messages: [
      {
        id: '1-1',
        sender: 'patient',
        senderName: 'You',
        content: 'Hello Dr. Chen, I received a notification that my lab results are ready. Could you please let me know if there\'s anything concerning?',
        timestamp: 'May 15, 2025 10:32 AM',
        read: true
      },
      {
        id: '1-2',
        sender: 'provider',
        senderName: 'Dr. Emily Chen',
        content: 'Hello! I\'ve reviewed your results, and everything looks normal. Your cholesterol levels have improved since your last test. Keep up the good work with your diet and exercise regimen!',
        timestamp: 'May 15, 2025 11:45 AM',
        read: true
      },
      {
        id: '1-3',
        sender: 'patient',
        senderName: 'You',
        content: 'That\'s great news! Thanks for the quick response. Should I continue with the same medication dosage?',
        timestamp: 'May 15, 2025 11:52 AM',
        read: true
      },
      {
        id: '1-4',
        sender: 'provider',
        senderName: 'Dr. Emily Chen',
        content: 'Your lab results look normal. No concerns at this time. Yes, please continue with the same dosage and we\'ll reassess at your next appointment in 3 months.',
        timestamp: '2h ago',
        read: false
      }
    ]
  },
  {
    id: '2',
    providerName: 'Dr. James Wilson',
    providerTitle: 'Cardiologist',
    lastMessage: 'Please schedule a follow-up appointment to discuss your echo results.',
    lastMessageTime: 'Yesterday',
    unread: 1,
    messages: [
      {
        id: '2-1',
        sender: 'provider',
        senderName: 'Dr. James Wilson',
        content: 'Hello, I\'ve reviewed your recent echocardiogram results. There are a few things I\'d like to discuss in person. Please schedule a follow-up appointment at your earliest convenience.',
        timestamp: 'Yesterday',
        read: false
      }
    ]
  },
  {
    id: '3',
    providerName: 'Dr. Sarah Johnson',
    providerTitle: 'Dermatologist',
    lastMessage: 'The prescription has been sent to your pharmacy.',
    lastMessageTime: 'May 12',
    unread: 0,
    messages: [
      {
        id: '3-1',
        sender: 'patient',
        senderName: 'You',
        content: 'Hi Dr. Johnson, the rash seems to be getting worse despite using the cream. I\'ve attached some photos.',
        timestamp: 'May 12, 2025 9:15 AM',
        read: true,
        attachments: [
          {
            name: 'rash-photo.jpg',
            type: 'image/jpeg'
          }
        ]
      },
      {
        id: '3-2',
        sender: 'provider',
        senderName: 'Dr. Sarah Johnson',
        content: 'Thank you for the update and photos. I\'ll prescribe a stronger medication. The prescription has been sent to your pharmacy.',
        timestamp: 'May 12, 2025 10:45 AM',
        read: true
      }
    ]
  }
];

const SecureMessaging: React.FC = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>(conversations[0]?.id || '');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  // Filter conversations by search query
  const filteredConversations = conversations.filter(conversation =>
    conversation.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '' && attachments.length === 0) return;
    
    const updatedConversations = conversations.map(conversation => {
      if (conversation.id === activeConversationId) {
        const newMsg: Message = {
          id: `${conversation.id}-${conversation.messages.length + 1}`,
          sender: 'patient',
          senderName: 'You',
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
      description: "Your secure message has been sent to the provider."
    });
  };
  
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to array and append to existing attachments
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
      
      // Reset input value to allow selecting the same file again
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
  
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <CardTitle className="text-autheo-primary flex items-center">
            <MessageCircle className="mr-2 h-5 w-5" /> Secure Messaging
          </CardTitle>
          <CardDescription className="text-slate-300">
            HIPAA-compliant secure communication with your healthcare providers
          </CardDescription>
        </CardHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Conversation List */}
          <div className="border-r border-slate-700 md:col-span-1 flex flex-col">
            <div className="p-3 border-b border-slate-700">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-900/50 border-slate-700 text-slate-100"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleOpenConversation(conversation.id)}
                    className={`w-full text-left p-3 border-b border-slate-700 hover:bg-slate-900/50 transition-colors ${
                      conversation.id === activeConversationId ? 'bg-slate-900/70' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-autheo-primary">{conversation.providerName}</p>
                        <p className="text-xs text-slate-400">{conversation.providerTitle}</p>
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
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-slate-400">No conversations found</p>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-slate-700 mt-auto">
              <Button className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900">
                <Plus className="h-4 w-4 mr-1" /> New Conversation
              </Button>
            </div>
          </div>
          
          {/* Active Conversation */}
          <div className="md:col-span-2 flex flex-col">
            {activeConversation ? (
              <>
                <div className="p-3 border-b border-slate-700 bg-slate-800/50">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-autheo-primary/20 flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-autheo-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-autheo-primary">{activeConversation.providerName}</h3>
                      <p className="text-xs text-slate-400">{activeConversation.providerTitle}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          message.sender === 'patient'
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
                  ))}
                </div>
                
                <div className="p-3 border-t border-slate-700">
                  {attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {attachments.map((file, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="flex items-center gap-1 bg-slate-900/50 text-slate-300 border-slate-700"
                        >
                          <Paperclip className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="ml-1 text-slate-400 hover:text-slate-300"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full flex-shrink-0 border-slate-700"
                      type="button"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Paperclip className="h-4 w-4 text-slate-300" />
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleAttachmentUpload}
                        multiple
                      />
                    </Button>
                    
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-10 bg-slate-900/50 border-slate-700 text-slate-100 flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    
                    <Button
                      className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900 flex-shrink-0"
                      onClick={handleSendMessage}
                      disabled={newMessage.trim() === '' && attachments.length === 0}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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
      </Card>
    </div>
  );
};

export default SecureMessaging;
