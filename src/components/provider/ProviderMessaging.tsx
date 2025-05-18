
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MessageCircle, Search, Filter, Tag, Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import SecureMessaging from '@/components/messaging/SecureMessaging';
import EnhancedMessageComposer from '@/components/messaging/EnhancedMessageComposer';
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
                  name="John Doe"
                  preview="I've been experiencing increased pain in my knee following the procedure..."
                  time="10:45 AM"
                  isUnread={true}
                  category="urgent"
                />
                <MessageItem 
                  name="Jane Smith"
                  preview="Thank you for the prescription refill. When should I come in for my next appointment?"
                  time="Yesterday"
                  isUnread={true}
                  category="follow-up"
                />
                <MessageItem 
                  name="Robert Johnson"
                  preview="I've checked my blood pressure as advised and the readings are as follows..."
                  time="May 16"
                  isUnread={false}
                  category="regular"
                />
                <MessageItem 
                  name="Emily Wilson"
                  preview="I'm having some side effects from the medication you prescribed. Would it be possible to..."
                  time="May 15"
                  isUnread={false}
                  category="medication"
                />
                <MessageItem 
                  name="Michael Brown"
                  preview="I've received the lab results notification but I can't seem to access them..."
                  time="May 15"
                  isUnread={false}
                  category="regular"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sent" className="m-0">
            <div className="border-r border-slate-700 h-full overflow-y-auto">
              <div className="space-y-0 divide-y divide-slate-700/50">
                <MessageItem 
                  name="Jane Smith"
                  preview="Your follow-up appointment has been scheduled for May 25th at 2:30 PM..."
                  time="Yesterday"
                  isUnread={false}
                  isSent={true}
                  category="follow-up"
                />
                <MessageItem 
                  name="John Doe"
                  preview="I've reviewed your test results and everything looks normal. Let's schedule a brief..."
                  time="May 16"
                  isUnread={false}
                  isSent={true}
                  category="regular"
                />
                <MessageItem 
                  name="Emily Wilson"
                  preview="I'm prescribing a different medication that should have fewer side effects..."
                  time="May 15"
                  isUnread={false}
                  isSent={true}
                  category="medication"
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
                    <h3 className="font-medium text-autheo-primary">John Doe</h3>
                    <p className="text-xs text-slate-400">Patient ID: P12345</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-700/30">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" /> Urgent
                    </Badge>
                    <Badge variant="outline" className="bg-slate-700/50 text-slate-300">
                      <Clock className="h-3.5 w-3.5 mr-1" /> 10:45 AM
                    </Badge>
                  </div>
                </div>
                
                {/* Patient's message */}
                <div className="flex gap-2 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-slate-700/50 flex-shrink-0"></div>
                  <div className="bg-slate-700/50 text-slate-200 p-3 rounded-lg rounded-tl-none">
                    <p className="text-sm">
                      I've been experiencing increased pain in my knee following the procedure last week. The pain medication isn't helping much. It's gotten worse over the last 24 hours and there's some swelling. Should I come in to be seen?
                    </p>
                    <div className="mt-1 text-xs text-slate-400">10:45 AM</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced message composer */}
            <EnhancedMessageComposer
              newMessage={newMessage}
              attachments={attachments}
              messageCategory={messageCategory}
              onMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              onAttachmentUpload={handleAttachmentUpload}
              onRemoveAttachment={handleRemoveAttachment}
              onCategoryChange={setMessageCategory}
              onScheduleAppointment={handleScheduleAppointment}
            />
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
  name: string;
  preview: string;
  time: string;
  isUnread?: boolean;
  isSent?: boolean;
  category: 'urgent' | 'follow-up' | 'medication' | 'regular' | 'results';
}> = ({ name, preview, time, isUnread = false, isSent = false, category }) => {
  
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
    <div className={`p-3 cursor-pointer ${isUnread ? 'bg-autheo-primary/5' : 'hover:bg-slate-700/20'}`}>
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
