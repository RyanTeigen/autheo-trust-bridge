import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Clock, 
  User, 
  Stethoscope,
  AlertTriangle,
  Pill,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PrescriptionMessage {
  id: string;
  prescription_id: string;
  medication_name: string;
  patient_name: string;
  provider_name: string;
  message_type: 'dosage_adjustment' | 'side_effect_report' | 'refill_reminder' | 'general_inquiry';
  subject: string;
  message: string;
  sender_role: 'patient' | 'provider';
  sender_name: string;
  read_at?: string;
  response_required: boolean;
  created_at: string;
}

interface PrescriptionCommunicationProps {
  userRole: 'patient' | 'provider';
  patientId?: string;
  providerId?: string;
}

const PrescriptionCommunication: React.FC<PrescriptionCommunicationProps> = ({ 
  userRole, 
  patientId, 
  providerId 
}) => {
  const [messages, setMessages] = useState<PrescriptionMessage[]>([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // New message form state
  const [newMessage, setNewMessage] = useState({
    prescription_id: '',
    message_type: '' as 'dosage_adjustment' | 'side_effect_report' | 'refill_reminder' | 'general_inquiry',
    subject: '',
    message: '',
    response_required: false
  });

  // Mock prescriptions data
  const prescriptions = [
    { id: '1', medication_name: 'Lisinopril 10mg', patient_name: 'John Smith' },
    { id: '2', medication_name: 'Metformin 500mg', patient_name: 'Sarah Johnson' },
    { id: '3', medication_name: 'Vitamin D3 2000 IU', patient_name: 'Mike Davis' }
  ];

  // Mock messages data
  useEffect(() => {
    const mockMessages: PrescriptionMessage[] = [
      {
        id: '1',
        prescription_id: '1',
        medication_name: 'Lisinopril 10mg',
        patient_name: 'John Smith',
        provider_name: 'Dr. Sarah Johnson',
        message_type: 'side_effect_report',
        subject: 'Experiencing mild dizziness',
        message: 'I\'ve been taking the Lisinopril for a week now and have been experiencing some mild dizziness, especially when standing up quickly. Should I be concerned about this?',
        sender_role: 'patient',
        sender_name: 'John Smith',
        response_required: true,
        created_at: '2024-01-26T10:30:00Z'
      },
      {
        id: '2',
        prescription_id: '1',
        medication_name: 'Lisinopril 10mg',
        patient_name: 'John Smith',
        provider_name: 'Dr. Sarah Johnson',
        message_type: 'side_effect_report',
        subject: 'Re: Experiencing mild dizziness',
        message: 'Thank you for reporting this. Mild dizziness can be a common side effect when starting Lisinopril. Please make sure to stand up slowly and stay hydrated. If it persists or worsens, please contact me immediately.',
        sender_role: 'provider',
        sender_name: 'Dr. Sarah Johnson',
        response_required: false,
        created_at: '2024-01-26T14:15:00Z'
      },
      {
        id: '3',
        prescription_id: '2',
        medication_name: 'Metformin 500mg',
        patient_name: 'Sarah Johnson',
        provider_name: 'Dr. Michael Lee',
        message_type: 'dosage_adjustment',
        subject: 'Dosage adjustment needed',
        message: 'Based on your recent lab results, I recommend increasing your Metformin dosage to 1000mg twice daily. Please schedule a follow-up appointment to discuss this change.',
        sender_role: 'provider',
        sender_name: 'Dr. Michael Lee',
        response_required: true,
        created_at: '2024-01-25T09:20:00Z'
      }
    ];

    setTimeout(() => {
      setMessages(mockMessages);
      setLoading(false);
    }, 500);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.prescription_id || !newMessage.subject || !newMessage.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prescription = prescriptions.find(p => p.id === newMessage.prescription_id);
      
      const message: PrescriptionMessage = {
        id: Date.now().toString(),
        prescription_id: newMessage.prescription_id,
        medication_name: prescription?.medication_name || '',
        patient_name: prescription?.patient_name || '',
        provider_name: userRole === 'provider' ? user?.email || 'Provider' : 'Dr. Smith',
        message_type: newMessage.message_type,
        subject: newMessage.subject,
        message: newMessage.message,
        sender_role: userRole,
        sender_name: userRole === 'patient' ? 'Patient' : 'Dr. Provider',
        response_required: newMessage.response_required,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [message, ...prev]);
      setShowNewMessage(false);
      setNewMessage({
        prescription_id: '',
        message_type: 'general_inquiry',
        subject: '',
        message: '',
        response_required: false
      });

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'side_effect_report': return 'bg-red-100/10 text-red-300 border-red-300/20';
      case 'dosage_adjustment': return 'bg-blue-100/10 text-blue-300 border-blue-300/20';
      case 'refill_reminder': return 'bg-green-100/10 text-green-300 border-green-300/20';
      case 'general_inquiry': return 'bg-gray-100/10 text-gray-300 border-gray-300/20';
      default: return 'bg-gray-100/10 text-gray-300 border-gray-300/20';
    }
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'side_effect_report': return 'Side Effect Report';
      case 'dosage_adjustment': return 'Dosage Adjustment';
      case 'refill_reminder': return 'Refill Reminder';
      case 'general_inquiry': return 'General Inquiry';
      default: return type;
    }
  };

  const filteredMessages = selectedPrescription 
    ? messages.filter(msg => msg.prescription_id === selectedPrescription)
    : messages;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-700 rounded mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-700 rounded-lg mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Prescription Communications</h2>
          <p className="text-slate-400">
            {userRole === 'patient' 
              ? 'Communicate with your healthcare providers about your medications'
              : 'Manage medication-related communications with your patients'
            }
          </p>
        </div>
        <Button 
          onClick={() => setShowNewMessage(true)}
          className="bg-autheo-primary hover:bg-autheo-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Filter by prescription */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Label className="text-slate-200 whitespace-nowrap">Filter by prescription:</Label>
            <Select value={selectedPrescription} onValueChange={setSelectedPrescription}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue placeholder="All prescriptions" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="">All prescriptions</SelectItem>
                {prescriptions.map((prescription) => (
                  <SelectItem key={prescription.id} value={prescription.id}>
                    {prescription.medication_name} - {prescription.patient_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPrescription && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPrescription('')}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <div className="space-y-4">
        {filteredMessages.map((message) => (
          <Card key={message.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-slate-700">
                          {message.sender_role === 'provider' ? (
                            <Stethoscope className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100">{message.subject}</h3>
                        <p className="text-slate-400 text-sm">
                          {message.sender_name} • {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-autheo-primary" />
                      <span className="text-slate-300">{message.medication_name}</span>
                      <Badge variant="outline" className={getMessageTypeColor(message.message_type)}>
                        {getMessageTypeLabel(message.message_type)}
                      </Badge>
                      {message.response_required && (
                        <Badge variant="outline" className="bg-amber-100/10 text-amber-300 border-amber-300/20">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Response Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-slate-200 leading-relaxed">{message.message}</p>
                </div>
                
                {message.response_required && message.sender_role !== userRole && (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-autheo-primary hover:bg-autheo-primary/90">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredMessages.length === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-600" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">No Messages</h3>
              <p className="text-slate-500">
                {selectedPrescription 
                  ? "No messages found for this prescription."
                  : "No prescription communications yet."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-slate-100">Send New Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <Label htmlFor="prescription" className="text-slate-200">Prescription *</Label>
                  <Select 
                    value={newMessage.prescription_id} 
                    onValueChange={(value) => setNewMessage(prev => ({ ...prev, prescription_id: value }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select prescription" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {prescriptions.map((prescription) => (
                        <SelectItem key={prescription.id} value={prescription.id}>
                          {prescription.medication_name} - {prescription.patient_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message_type" className="text-slate-200">Message Type *</Label>
                  <Select 
                    value={newMessage.message_type} 
                    onValueChange={(value: any) => setNewMessage(prev => ({ ...prev, message_type: value }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select message type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                      <SelectItem value="side_effect_report">Side Effect Report</SelectItem>
                      <SelectItem value="dosage_adjustment">Dosage Adjustment</SelectItem>
                      <SelectItem value="refill_reminder">Refill Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-slate-200">Subject *</Label>
                  <Input
                    id="subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                    className="bg-slate-700 border-slate-600"
                    placeholder="Enter message subject"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-slate-200">Message *</Label>
                  <Textarea
                    id="message"
                    value={newMessage.message}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                    className="bg-slate-700 border-slate-600"
                    placeholder="Type your message here..."
                    rows={5}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="response_required"
                    checked={newMessage.response_required}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, response_required: e.target.checked }))}
                    className="rounded border-slate-600"
                  />
                  <Label htmlFor="response_required" className="text-slate-200">
                    Response required
                  </Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-autheo-primary hover:bg-autheo-primary/90">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewMessage(false)}
                    className="flex-1 border-slate-600 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PrescriptionCommunication;