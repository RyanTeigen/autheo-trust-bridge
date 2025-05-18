
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lock, Send, Paperclip, Image, FileText, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    role: 'provider' | 'patient';
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  files?: Array<{
    name: string;
    type: 'image' | 'document';
    url: string;
    encrypted: boolean;
  }>;
  encrypted: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    role: 'provider' | 'patient';
    avatar?: string;
  };
  latestMessage: string;
  unreadCount: number;
  lastActivity: Date;
  status: 'active' | 'archived';
}

const SecureMessaging: React.FC = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv1',
      participant: {
        id: 'doc1',
        name: 'Dr. Emily Chen',
        role: 'provider',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
      },
      latestMessage: 'Your test results look normal. No need to worry!',
      unreadCount: 0,
      lastActivity: new Date('2025-05-18T10:30:00'),
      status: 'active'
    },
    {
      id: 'conv2',
      participant: {
        id: 'doc2',
        name: 'Dr. Marcus Johnson',
        role: 'provider',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
      },
      latestMessage: 'Please make sure to take your medication regularly.',
      unreadCount: 2,
      lastActivity: new Date('2025-05-17T14:45:00'),
      status: 'active'
    }
  ]);
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>('conv1');
  const [messageText, setMessageText] = useState('');
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  
  // Mock messages for the selected conversation
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    'conv1': [
      {
        id: 'msg1',
        sender: {
          id: 'doc1',
          name: 'Dr. Emily Chen',
          role: 'provider',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
        },
        content: "Hi there! I've reviewed your recent blood work results. Everything looks normal, but I noticed your vitamin D levels are a bit low. I'd recommend a supplement.",
        timestamp: new Date('2025-05-18T09:30:00'),
        encrypted: true
      },
      {
        id: 'msg2',
        sender: {
          id: 'patient1',
          name: 'You',
          role: 'patient'
        },
        content: "Thank you, Dr. Chen! How much vitamin D should I take daily?",
        timestamp: new Date('2025-05-18T09:45:00'),
        encrypted: true
      },
      {
        id: 'msg3',
        sender: {
          id: 'doc1',
          name: 'Dr. Emily Chen',
          role: 'provider',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
        },
        content: "I'd recommend 2000 IU daily. Here's your test report for reference.",
        timestamp: new Date('2025-05-18T10:30:00'),
        files: [
          {
            name: 'blood_test_results.pdf',
            type: 'document',
            url: '#',
            encrypted: true
          }
        ],
        encrypted: true
      }
    ],
    'conv2': [
      {
        id: 'msg4',
        sender: {
          id: 'doc2',
          name: 'Dr. Marcus Johnson',
          role: 'provider',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
        },
        content: "Hello! Just following up on your prescription. Have you been taking it regularly?",
        timestamp: new Date('2025-05-17T13:20:00'),
        encrypted: true
      },
      {
        id: 'msg5',
        sender: {
          id: 'doc2',
          name: 'Dr. Marcus Johnson',
          role: 'provider',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
        },
        content: "Also, please make sure to take your medication regularly. It's important for managing your condition.",
        timestamp: new Date('2025-05-17T14:45:00'),
        encrypted: true
      }
    ]
  });
  
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    
    // Mark messages as read
    setConversations(conversations.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));
  };
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    const newMessage: Message = {
      id: `msg${Date.now()}`,
      sender: {
        id: 'patient1',
        name: 'You',
        role: 'patient'
      },
      content: messageText,
      timestamp: new Date(),
      encrypted: encryptionEnabled
    };
    
    // Add message to the conversation
    const updatedMessages = { 
      ...messages,
      [selectedConversation]: [...(messages[selectedConversation] || []), newMessage]
    };
    
    setMessages(updatedMessages);
    
    // Update the conversation list
    setConversations(conversations.map(conv => 
      conv.id === selectedConversation ? {
        ...conv,
        latestMessage: messageText,
        lastActivity: new Date()
      } : conv
    ));
    
    // Clear the input
    setMessageText('');
    
    toast({
      title: "Message Sent",
      description: encryptionEnabled ? "Message was encrypted end-to-end" : "Message sent unencrypted",
    });
  };
  
  const selectedConv = conversations.find(conv => conv.id === selectedConversation);
  const currentMessages = selectedConversation ? messages[selectedConversation] || [] : [];
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100 h-[600px] flex flex-col">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30 px-4 py-3">
        <CardTitle className="text-autheo-primary text-lg">Secure Messaging</CardTitle>
        <CardDescription className="text-slate-300">
          End-to-end encrypted communication with your healthcare providers
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-1 overflow-hidden">
        {/* Conversation List */}
        <div className="w-1/3 border-r border-slate-700 flex flex-col">
          <div className="p-3 border-b border-slate-700">
            <Input 
              placeholder="Search conversations..." 
              className="bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map(conversation => (
                <div 
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`p-3 border-b border-slate-700 cursor-pointer hover:bg-slate-700/50 ${
                    selectedConversation === conversation.id ? 'bg-slate-700/70' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage 
                        src={conversation.participant.avatar} 
                        alt={conversation.participant.name}
                      />
                      <AvatarFallback className="bg-autheo-primary text-autheo-dark">
                        {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-100 truncate">
                          {conversation.participant.name}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {conversation.lastActivity.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-300 truncate">
                          {conversation.latestMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-autheo-primary text-autheo-dark text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400">
                <User className="h-10 w-10 mx-auto mb-2 text-slate-500" />
                <p>No conversations yet</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Message View */}
        <div className="w-2/3 flex flex-col">
          {selectedConv ? (
            <>
              {/* Conversation header */}
              <div className="px-4 py-3 border-b border-slate-700 bg-slate-700/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={selectedConv.participant.avatar} 
                      alt={selectedConv.participant.name}
                    />
                    <AvatarFallback className="bg-autheo-primary text-autheo-dark">
                      {selectedConv.participant.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-slate-100">{selectedConv.participant.name}</h3>
                    {selectedConv.participant.role === 'provider' && (
                      <p className="text-xs text-slate-400">Healthcare Provider</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Lock className="h-3 w-3 text-green-400" />
                  <span>End-to-End Encrypted</span>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMessages.map(message => {
                  const isCurrentUser = message.sender.role === 'patient';
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1 flex'}`}>
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 mr-2 mt-1">
                            <AvatarImage 
                              src={message.sender.avatar} 
                              alt={message.sender.name}
                            />
                            <AvatarFallback className="bg-autheo-primary text-autheo-dark">
                              {message.sender.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div>
                          <div 
                            className={`rounded-lg p-3 mb-1 ${
                              isCurrentUser 
                                ? 'bg-autheo-primary text-autheo-dark' 
                                : 'bg-slate-700 text-slate-100'
                            }`}
                          >
                            {message.content}
                            
                            {message.files && message.files.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.files.map((file, index) => (
                                  <div 
                                    key={index} 
                                    className={`flex items-center gap-2 p-2 rounded ${
                                      isCurrentUser ? 'bg-autheo-primary/80' : 'bg-slate-600'
                                    }`}
                                  >
                                    {file.type === 'image' ? (
                                      <Image className="h-4 w-4" />
                                    ) : (
                                      <FileText className="h-4 w-4" />
                                    )}
                                    <span className="text-sm truncate">{file.name}</span>
                                    {file.encrypted && <Lock className="h-3 w-3 text-green-400" />}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">
                              {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            {message.encrypted && <Lock className="h-3 w-3 text-green-400" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Input */}
              <div className="p-3 border-t border-slate-700 bg-slate-700/30">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="text-slate-400">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      className="min-h-10 max-h-32 bg-slate-700 border-slate-600 text-slate-100 resize-none"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2 px-1">
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      id="encryption-toggle"
                      checked={encryptionEnabled}
                      onChange={() => setEncryptionEnabled(!encryptionEnabled)}
                      className="accent-autheo-primary"
                    />
                    <label htmlFor="encryption-toggle" className="text-xs text-slate-400 flex items-center gap-1">
                      <Lock className="h-3 w-3 text-green-400" />
                      End-to-end encryption
                    </label>
                  </div>
                  
                  <div className="text-xs text-slate-400">
                    {encryptionEnabled ? 'Only you and the provider can read these messages' : 'Warning: Messages will not be encrypted'}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Lock className="h-12 w-12 mx-auto text-slate-500 mb-2" />
                <h3 className="font-medium text-slate-300">Secure Messaging</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  Select a conversation to start securely messaging with your healthcare provider.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecureMessaging;
