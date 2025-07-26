
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MessageCircle, Search, Filter, Tag, Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import SecureMessaging from '@/components/messaging/SecureMessaging';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeMessaging } from '@/hooks/useRealTimeMessaging';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProviderMessagingProps {
  isEnhanced?: boolean;
}

const ProviderMessaging: React.FC<ProviderMessagingProps> = ({ isEnhanced = false }) => {
  const { toast } = useToast();
  
  // Use real-time messaging hook for enhanced view
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
  } = useRealTimeMessaging(true); // isProviderView = true

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [messageCategory, setMessageCategory] = useState('regular');

  // Filter conversations based on search and filter criteria
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = 
      (conversation.participant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conversation.messages?.[conversation.messages.length - 1]?.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'unread' && (conversation.unread_count || 0) > 0) ||
      (filter === 'urgent' && conversation.subject?.toLowerCase().includes('urgent'));
    
    return matchesSearch && matchesFilter;
  });

  const handleSendMessage = () => {
    if (newMessage.trim() === '' && attachments.length === 0) return;
    
    sendMessage();
    toast({
      title: messageCategory === 'urgent' ? "Urgent Message Sent" : "Message Sent",
      description: "Your message has been delivered securely.",
      variant: messageCategory === 'urgent' ? "destructive" : "default"
    });
  };

  const handleRemoveAttachment = (index: number) => {
    removeAttachment(index);
  };

  const handleScheduleAppointment = () => {
    toast({
      title: "Scheduling Assistant",
      description: "Opening appointment scheduler with this patient.",
    });
  };

  // Handle conversation selection
  const handleConversationSelect = (id: string) => {
    setActiveConversationId(id);
    markMessagesAsRead(id);
  };

  // Fallback to the original component if not enhanced
  if (!isEnhanced) {
    return <SecureMessaging isProviderView={true} />;
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <CardTitle className="text-autheo-primary">Secure Messaging</CardTitle>
        <CardDescription className="text-slate-300">
          Communicate securely with patients and healthcare providers
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="inbox">
        <div className="px-4 pt-4 border-b border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-slate-700">
              <TabsTrigger value="inbox" className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">
                Inbox
              </TabsTrigger>
              <TabsTrigger value="sent" className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">
                Sent
              </TabsTrigger>
              <TabsTrigger value="archived" className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900">
                Archived
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-slate-100"
                />
              </div>
              
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[120px] bg-slate-700/50 border-slate-600 text-slate-200">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          <TabsContent value="inbox" className="m-0">
            <div className="border-r border-slate-700 h-full overflow-y-auto">
              <div className="space-y-0 divide-y divide-slate-700/50">
                {loading ? (
                  <div className="p-8 text-center text-slate-400">Loading conversations...</div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <MessageItem 
                      key={conversation.id}
                      id={conversation.id}
                      name={conversation.participant_name || 'Unknown Patient'}
                      preview={conversation.messages?.[conversation.messages.length - 1]?.content || 'No messages'}
                      time={new Date(conversation.last_message_at).toLocaleString()}
                      isUnread={(conversation.unread_count || 0) > 0}
                      category={conversation.subject?.toLowerCase().includes('urgent') ? 'urgent' : 'regular'}
                      isActive={activeConversationId === conversation.id}
                      onSelect={handleConversationSelect}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">No conversations found</div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sent" className="m-0">
            <div className="border-r border-slate-700 h-full overflow-y-auto">
              <div className="space-y-0 divide-y divide-slate-700/50">
                <MessageItem 
                  id="sent_1"
                  name="Jane Smith"
                  preview="Your follow-up appointment has been scheduled for May 25th at 2:30 PM..."
                  time="Yesterday"
                  isUnread={false}
                  isSent={true}
                  category="follow-up"
                  isActive={activeConversationId === "sent_1"}
                  onSelect={handleConversationSelect}
                />
                <MessageItem 
                  id="sent_2"
                  name="John Doe"
                  preview="I've reviewed your test results and everything looks normal. Let's schedule a brief..."
                  time="May 16"
                  isUnread={false}
                  isSent={true}
                  category="regular"
                  isActive={activeConversationId === "sent_2"}
                  onSelect={handleConversationSelect}
                />
                <MessageItem 
                  id="sent_3"
                  name="Emily Wilson"
                  preview="I'm prescribing a different medication that should have fewer side effects..."
                  time="May 15"
                  isUnread={false}
                  isSent={true}
                  category="medication"
                  isActive={activeConversationId === "sent_3"}
                  onSelect={handleConversationSelect}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="archived" className="m-0">
            <div className="border-r border-slate-700 h-full overflow-y-auto">
              <div className="p-8 text-center text-slate-400">
                No archived messages
              </div>
            </div>
          </TabsContent>
          
          <div className="md:col-span-2 flex flex-col border-l border-slate-700 h-full">
            {activeConversation ? (
              <>
                <div className="flex-1 p-4 overflow-y-auto bg-slate-900/30">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border-b border-slate-700 pb-3">
                      <div>
                        <h3 className="font-medium text-autheo-primary">
                          {activeConversation.participant_name || 'Unknown Patient'}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Patient ID: P{activeConversation.patient_id?.slice(-5)}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {(activeConversation.unread_count || 0) > 0 && (
                          <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-700/30">
                            <AlertCircle className="h-3.5 w-3.5 mr-1" /> {activeConversation.unread_count} Unread
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-slate-700/50 text-slate-300">
                          <Clock className="h-3.5 w-3.5 mr-1" /> 
                          {new Date(activeConversation.last_message_at).toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Real message content from database */}
                    <div className="space-y-4">
                      {activeConversation.messages?.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex gap-2 max-w-[80%] ${
                            message.sender_type === 'provider' ? 'ml-auto justify-end' : ''
                          }`}
                        >
                          {message.sender_type === 'patient' && (
                            <div className="w-8 h-8 rounded-full bg-slate-700/50 flex-shrink-0"></div>
                          )}
                          <div className={`p-3 rounded-lg ${
                            message.sender_type === 'provider'
                              ? 'bg-autheo-primary/20 text-slate-200 rounded-tr-none'
                              : 'bg-slate-700/50 text-slate-200 rounded-tl-none'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className={`mt-1 text-xs text-slate-400 ${
                              message.sender_type === 'provider' ? 'text-right' : ''
                            }`}>
                              {new Date(message.created_at).toLocaleString()}
                              {!message.is_read && message.sender_type === 'patient' && (
                                <span className="ml-2 text-autheo-primary">●</span>
                              )}
                            </div>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((attachment, idx) => (
                                  <div key={idx} className="text-xs text-slate-400 flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {attachment.file_name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {message.sender_type === 'provider' && (
                            <div className="w-8 h-8 rounded-full bg-autheo-primary/20 flex-shrink-0 flex items-center justify-center">
                              <span className="text-xs font-medium text-autheo-primary">You</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-slate-300">No conversation selected</h3>
                  <p className="text-slate-400 mt-1">Select a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
            
            {/* Message composer - only show when conversation is selected */}
            {activeConversation && (
              <div className="p-3 border-t border-slate-700">
                <div className="flex gap-2 mb-3">
                  <Select 
                    value={messageCategory} 
                    onValueChange={setMessageCategory}
                  >
                    <SelectTrigger className={`w-full sm:w-auto ${
                      messageCategory === 'urgent' ? 'bg-red-900/20 text-red-400 border-red-700/30' :
                      messageCategory === 'follow-up' ? 'bg-blue-900/20 text-blue-400 border-blue-700/30' :
                      messageCategory === 'medication' ? 'bg-green-900/20 text-green-400 border-green-700/30' :
                      messageCategory === 'results' ? 'bg-purple-900/20 text-purple-400 border-purple-700/30' :
                      messageCategory === 'referral' ? 'bg-amber-900/20 text-amber-400 border-amber-700/30' :
                      'bg-slate-700/30 text-slate-300 border-slate-600'
                    }`}>
                      <div className="flex items-center">
                        <Tag className="h-3.5 w-3.5 mr-1.5" />
                        <SelectValue placeholder="Select category" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="regular">Regular Message</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="results">Test Results</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline"
                    className="border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                  >
                    <Tag className="h-4 w-4 mr-1.5" />
                    Templates
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="ml-auto border-slate-700 bg-blue-900/20 text-blue-400 hover:bg-blue-900/30"
                    onClick={handleScheduleAppointment}
                  >
                    <Clock className="h-4 w-4 mr-1.5" />
                    Schedule
                  </Button>
                </div>
                
                {attachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="flex items-center gap-1 bg-slate-900/50 text-slate-300 border-slate-700"
                      >
                        <Tag className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button
                          onClick={() => handleRemoveAttachment(index)}
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
                    <Tag className="h-4 w-4 text-slate-300" />
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleAttachmentUpload}
                      multiple
                    />
                  </Button>
                  
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-slate-100 flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  
                  <Button
                    className={`${
                      messageCategory === 'urgent' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900'
                    } flex-shrink-0`}
                    onClick={handleSendMessage}
                    disabled={newMessage.trim() === '' && attachments.length === 0}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Tabs>
      
      <CardFooter className="bg-slate-700/30 border-t border-slate-700 px-4 py-3 text-xs text-slate-400 flex justify-between">
        <div className="flex items-center">
          <MessageCircle className="h-4 w-4 mr-1.5 text-autheo-primary" />
          End-to-end encrypted messaging
        </div>
        <div>
          Messages are archived after 90 days
        </div>
      </CardFooter>
    </Card>
  );
};

// Helper component for message list items
const MessageItem: React.FC<{
  id: string;
  name: string;
  preview: string;
  time: string;
  isUnread?: boolean;
  isSent?: boolean;
  isActive?: boolean;
  onSelect: (id: string) => void;
  category: 'urgent' | 'follow-up' | 'medication' | 'regular' | 'results';
}> = ({ id, name, preview, time, isUnread = false, isSent = false, isActive = false, onSelect, category }) => {
  
  const getCategoryBadge = () => {
    switch(category) {
      case 'urgent':
        return <Badge variant="outline" className="ml-auto bg-red-900/20 text-red-400 border-red-700/30 flex items-center"><AlertCircle className="h-3 w-3 mr-1" /> Urgent</Badge>;
      case 'follow-up':
        return <Badge variant="outline" className="ml-auto bg-blue-900/20 text-blue-400 border-blue-700/30 flex items-center"><Clock className="h-3 w-3 mr-1" /> Follow-up</Badge>;
      case 'medication':
        return <Badge variant="outline" className="ml-auto bg-green-900/20 text-green-400 border-green-700/30 flex items-center"><Tag className="h-3 w-3 mr-1" /> Medication</Badge>;
      case 'results':
        return <Badge variant="outline" className="ml-auto bg-purple-900/20 text-purple-400 border-purple-700/30 flex items-center"><Filter className="h-3 w-3 mr-1" /> Results</Badge>;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`p-3 cursor-pointer ${isActive ? 'bg-slate-900/70' : isUnread ? 'bg-autheo-primary/5' : 'hover:bg-slate-700/20'}`}
      onClick={() => {
        console.log("Message item clicked:", id);
        onSelect(id);
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <h4 className={`${isUnread ? 'font-medium text-autheo-primary' : 'text-slate-300'}`}>
          {name} {isSent && <span className="text-xs text-slate-400">(You)</span>}
        </h4>
        <span className="text-xs text-slate-400">{time}</span>
      </div>
      <p className={`text-sm truncate ${isUnread ? 'text-slate-200' : 'text-slate-400'}`}>
        {preview}
      </p>
      <div className="flex items-center mt-1">
        {isUnread && <div className="w-2 h-2 rounded-full bg-autheo-primary mr-1.5"></div>}
        {getCategoryBadge()}
      </div>
    </div>
  );
};

export default ProviderMessaging;
