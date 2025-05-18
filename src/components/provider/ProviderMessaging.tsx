
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MessageCircle, Search, Filter, Tag, Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import SecureMessaging from '@/components/messaging/SecureMessaging';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [messageCategory, setMessageCategory] = useState('regular');
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Add state for active conversation
  const [activeConversationId, setActiveConversationId] = useState<string>('msg_1');
  
  const handleSendMessage = () => {
    toast({
      title: messageCategory === 'urgent' ? "Urgent Message Sent" : "Message Sent",
      description: "Your message has been delivered securely.",
      variant: messageCategory === 'urgent' ? "destructive" : "default"
    });
    setNewMessage('');
    setAttachments([]);
  };
  
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAttachments = Array.from(e.target.files);
      setAttachments([...attachments, ...newAttachments]);
    }
  };
  
  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };
  
  const handleScheduleAppointment = () => {
    toast({
      title: "Scheduling Assistant",
      description: "Opening appointment scheduler with this patient.",
    });
  };
  
  // Handle conversation selection
  const handleConversationSelect = (id: string) => {
    console.log("Enhanced provider view - selecting conversation:", id);
    setActiveConversationId(id);
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
              {/* Enhanced message list with categories */}
              <div className="space-y-0 divide-y divide-slate-700/50">
                <MessageItem 
                  id="msg_1"
                  name="John Doe"
                  preview="I've been experiencing increased pain in my knee following the procedure..."
                  time="10:45 AM"
                  isUnread={true}
                  category="urgent"
                  isActive={activeConversationId === "msg_1"}
                  onSelect={handleConversationSelect}
                />
                <MessageItem 
                  id="msg_2"
                  name="Jane Smith"
                  preview="Thank you for the prescription refill. When should I come in for my next appointment?"
                  time="Yesterday"
                  isUnread={true}
                  category="follow-up"
                  isActive={activeConversationId === "msg_2"}
                  onSelect={handleConversationSelect}
                />
                <MessageItem 
                  id="msg_3"
                  name="Robert Johnson"
                  preview="I've checked my blood pressure as advised and the readings are as follows..."
                  time="May 16"
                  isUnread={false}
                  category="regular"
                  isActive={activeConversationId === "msg_3"}
                  onSelect={handleConversationSelect}
                />
                <MessageItem 
                  id="msg_4"
                  name="Emily Wilson"
                  preview="I'm having some side effects from the medication you prescribed. Would it be possible to..."
                  time="May 15"
                  isUnread={false}
                  category="medication"
                  isActive={activeConversationId === "msg_4"}
                  onSelect={handleConversationSelect}
                />
                <MessageItem 
                  id="msg_5"
                  name="Michael Brown"
                  preview="I've received the lab results notification but I can't seem to access them..."
                  time="May 15"
                  isUnread={false}
                  category="regular"
                  isActive={activeConversationId === "msg_5"}
                  onSelect={handleConversationSelect}
                />
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
            <div className="flex-1 p-4 overflow-y-auto bg-slate-900/30">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border-b border-slate-700 pb-3">
                  <div>
                    <h3 className="font-medium text-autheo-primary">
                      {activeConversationId === "msg_1" || activeConversationId === "sent_2" ? "John Doe" : 
                       activeConversationId === "msg_2" || activeConversationId === "sent_1" ? "Jane Smith" :
                       activeConversationId === "msg_3" ? "Robert Johnson" :
                       activeConversationId === "msg_4" || activeConversationId === "sent_3" ? "Emily Wilson" :
                       activeConversationId === "msg_5" ? "Michael Brown" : "Select a conversation"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {activeConversationId.startsWith("msg_") ? "Patient ID: P12345" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {activeConversationId === "msg_1" && (
                      <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-700/30">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" /> Urgent
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-slate-700/50 text-slate-300">
                      <Clock className="h-3.5 w-3.5 mr-1" /> {activeConversationId === "msg_1" ? "10:45 AM" : 
                                                             activeConversationId === "msg_2" || activeConversationId === "sent_1" ? "Yesterday" :
                                                             activeConversationId === "msg_3" || activeConversationId === "sent_2" ? "May 16" : "May 15"}
                    </Badge>
                  </div>
                </div>
                
                {/* Message content - shows different content based on activeConversationId */}
                {activeConversationId && (
                  <div className="flex gap-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex-shrink-0"></div>
                    <div className="bg-slate-700/50 text-slate-200 p-3 rounded-lg rounded-tl-none">
                      <p className="text-sm">
                        {activeConversationId === "msg_1" ? 
                          "I've been experiencing increased pain in my knee following the procedure last week. The pain medication isn't helping much. It's gotten worse over the last 24 hours and there's some swelling. Should I come in to be seen?" :
                         activeConversationId === "msg_2" ? 
                          "Thank you for the prescription refill. When should I come in for my next appointment? I'm feeling much better but would like to follow up." :
                         activeConversationId === "msg_3" ?
                          "I've checked my blood pressure as advised and the readings are as follows: 128/82, 130/84, and 126/80 over the past three days. Is this within the expected range based on my new medication?" :
                         activeConversationId === "msg_4" ?
                          "I'm having some side effects from the medication you prescribed. Would it be possible to discuss alternatives? I'm experiencing dizziness and nausea, especially in the mornings." :
                         activeConversationId === "msg_5" ?
                          "I've received the lab results notification but I can't seem to access them through the patient portal. Could you please resend them or help me access them?" :
                         activeConversationId === "sent_1" ?
                          "Your follow-up appointment has been scheduled for May 25th at 2:30 PM. Please arrive 15 minutes early to complete any necessary paperwork. Let me know if you need to reschedule." :
                         activeConversationId === "sent_2" ?
                          "I've reviewed your test results and everything looks normal. Let's schedule a brief follow-up in three months to make sure your condition continues to improve. In the meantime, continue with the prescribed medication." :
                         activeConversationId === "sent_3" ?
                          "I'm prescribing a different medication that should have fewer side effects. Please pick it up at your pharmacy and start tomorrow. Stop the current medication today. Let me know if you experience any issues with the new prescription." :
                          "Select a conversation to view messages."}
                      </p>
                      <div className="mt-1 text-xs text-slate-400">
                        {activeConversationId === "msg_1" ? "10:45 AM" : 
                         activeConversationId === "msg_2" || activeConversationId === "sent_1" ? "Yesterday, 3:22 PM" :
                         activeConversationId === "msg_3" || activeConversationId === "sent_2" ? "May 16, 11:30 AM" : "May 15, 2:15 PM"}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show provider's reply for some conversations */}
                {(activeConversationId === "msg_3" || activeConversationId === "msg_5") && (
                  <div className="flex gap-2 max-w-[80%] ml-auto justify-end">
                    <div className="bg-autheo-primary/20 text-slate-200 p-3 rounded-lg rounded-tr-none">
                      <p className="text-sm">
                        {activeConversationId === "msg_3" ? 
                          "Those readings look good, right within the target range we discussed. Continue with the current dosage and we'll reassess at your next visit." :
                         "I've reset your access to the lab results. You should be able to view them now. If you continue having issues, please call our technical support at 555-123-4567."}
                      </p>
                      <div className="mt-1 text-xs text-slate-400 text-right">
                        {activeConversationId === "msg_3" ? "May 16, 2:45 PM" : "May 15, 3:30 PM"}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-autheo-primary/20 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-autheo-primary">You</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Message composer */}
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
