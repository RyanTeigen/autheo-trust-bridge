import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  User, 
  MapPin,
  Phone,
  Monitor,
  FileText,
  AlertCircle
} from 'lucide-react';
import { format, addDays, startOfDay, addHours } from 'date-fns';

interface AppointmentSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
  providerId: string;
  providerName: string;
  specialty: string;
  appointmentType: 'telehealth' | 'in-person' | 'hybrid';
}

interface TelehealthAppointment {
  id: string;
  patientId: string;
  providerId: string;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  type: 'consultation' | 'follow-up' | 'urgent-care' | 'mental-health';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  roomId?: string;
  preAppointmentForms?: string[];
}

const TelehealthScheduler: React.FC = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [appointmentType, setAppointmentType] = useState<string>('consultation');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    reason: ''
  });

  // Mock data for available slots
  const mockSlots: AppointmentSlot[] = [
    {
      id: '1',
      date: addDays(new Date(), 1),
      startTime: '09:00',
      endTime: '09:30',
      available: true,
      providerId: 'dr-smith',
      providerName: 'Dr. Sarah Smith',
      specialty: 'Primary Care',
      appointmentType: 'telehealth'
    },
    {
      id: '2',
      date: addDays(new Date(), 1),
      startTime: '10:00',
      endTime: '10:30',
      available: true,
      providerId: 'dr-johnson',
      providerName: 'Dr. Mike Johnson',
      specialty: 'Cardiology',
      appointmentType: 'telehealth'
    },
    {
      id: '3',
      date: addDays(new Date(), 2),
      startTime: '14:00',
      endTime: '14:30',
      available: true,
      providerId: 'dr-wilson',
      providerName: 'Dr. Emily Wilson',
      specialty: 'Dermatology',
      appointmentType: 'telehealth'
    },
    {
      id: '4',
      date: addDays(new Date(), 2),
      startTime: '15:30',
      endTime: '16:00',
      available: false,
      providerId: 'dr-smith',
      providerName: 'Dr. Sarah Smith',
      specialty: 'Primary Care',
      appointmentType: 'telehealth'
    }
  ];

  const availableSlotsForDate = mockSlots.filter(slot => 
    format(slot.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && 
    slot.available
  );

  const handleScheduleAppointment = async () => {
    if (!selectedSlot || !appointmentType || !patientInfo.name || !patientInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a time slot",
        variant: "destructive",
      });
      return;
    }

    try {
      // In real implementation, this would call the API
      const appointment: TelehealthAppointment = {
        id: `apt-${Date.now()}`,
        patientId: 'current-user-id',
        providerId: selectedSlot.providerId,
        scheduledDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        type: appointmentType as any,
        status: 'scheduled',
        notes: appointmentNotes,
        roomId: `room-${Date.now()}`,
      };

      console.log('Scheduling appointment:', appointment);

      toast({
        title: "Appointment Scheduled",
        description: `Your telehealth appointment with ${selectedSlot.providerName} has been scheduled for ${format(selectedSlot.date, 'MMMM d, yyyy')} at ${selectedSlot.startTime}`,
      });

      // Reset form
      setSelectedSlot(null);
      setAppointmentType('consultation');
      setAppointmentNotes('');
      setPatientInfo({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        reason: ''
      });

    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Schedule Telehealth Appointment
          </CardTitle>
          <CardDescription>
            Book a virtual appointment with one of our healthcare providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar and slot selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date < startOfDay(new Date())}
                  className="rounded-md border"
                />
              </div>

              {selectedDate && (
                <div>
                  <Label className="text-base font-medium">Available Time Slots</Label>
                  <div className="space-y-2 mt-2">
                    {availableSlotsForDate.length > 0 ? (
                      availableSlotsForDate.map((slot) => (
                        <div
                          key={slot.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedSlot?.id === slot.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                              <Badge variant="secondary">{slot.appointmentType}</Badge>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{slot.providerName}</span>
                            </div>
                            <div className="text-gray-500">{slot.specialty}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No available slots for this date</p>
                        <p className="text-sm">Please select a different date</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Appointment details form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="appointment-type">Appointment Type</Label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">General Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                    <SelectItem value="urgent-care">Urgent Care</SelectItem>
                    <SelectItem value="mental-health">Mental Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Patient Information</Label>
                
                <div>
                  <Label htmlFor="patient-name">Full Name *</Label>
                  <Input
                    id="patient-name"
                    value={patientInfo.name}
                    onChange={(e) => setPatientInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <Label htmlFor="patient-email">Email Address *</Label>
                  <Input
                    id="patient-email"
                    type="email"
                    value={patientInfo.email}
                    onChange={(e) => setPatientInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="patient-phone">Phone Number</Label>
                  <Input
                    id="patient-phone"
                    type="tel"
                    value={patientInfo.phone}
                    onChange={(e) => setPatientInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="patient-dob">Date of Birth</Label>
                  <Input
                    id="patient-dob"
                    type="date"
                    value={patientInfo.dateOfBirth}
                    onChange={(e) => setPatientInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    value={patientInfo.reason}
                    onChange={(e) => setPatientInfo(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Briefly describe the reason for your visit"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    placeholder="Any additional information for the provider"
                    rows={2}
                  />
                </div>
              </div>

              {selectedSlot && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Appointment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(selectedSlot.date, 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      <span>{selectedSlot.providerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="h-4 w-4" />
                      <span>Telehealth Appointment</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Before your appointment:</p>
                    <ul className="mt-1 text-yellow-700 space-y-1">
                      <li>• Test your camera and microphone</li>
                      <li>• Ensure stable internet connection</li>
                      <li>• Have your insurance card ready</li>
                      <li>• Prepare list of current medications</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleScheduleAppointment}
                disabled={!selectedSlot || !patientInfo.name || !patientInfo.email}
                className="w-full"
                size="lg"
              >
                Schedule Telehealth Appointment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Technology Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Monitor className="h-6 w-6 text-blue-500" />
              <div>
                <p className="font-medium">Device</p>
                <p className="text-sm text-gray-600">Computer, tablet, or smartphone</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Video className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium">Camera & Microphone</p>
                <p className="text-sm text-gray-600">Built-in or external</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Phone className="h-6 w-6 text-purple-500" />
              <div>
                <p className="font-medium">Internet Connection</p>
                <p className="text-sm text-gray-600">Stable broadband connection</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelehealthScheduler;