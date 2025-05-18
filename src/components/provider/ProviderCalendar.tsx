
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, Plus, Video, MapPin, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: string;
  duration?: string;
  location?: 'in-person' | 'virtual';
  notes?: string;
}

interface ProviderCalendarProps {
  appointments: Appointment[];
  onAction: () => void;
}

const ProviderCalendar: React.FC<ProviderCalendarProps> = ({ appointments, onAction }) => {
  const [view, setView] = useState('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState('all');
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const prevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };
  
  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  
  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };
  
  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };
  
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = currentDate.getDay();
    startOfWeek.setDate(currentDate.getDate() - day);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  const getAppointmentForTimeSlot = (time: string) => {
    return appointments.find(appointment => appointment.time === time);
  };
  
  const getColorForAppointmentType = (type: string) => {
    switch(type.toLowerCase()) {
      case 'follow-up': return 'bg-blue-900/20 text-blue-400 border-blue-600/30';
      case 'new patient': return 'bg-green-900/20 text-green-400 border-green-600/30';
      case 'lab results': return 'bg-purple-900/20 text-purple-400 border-purple-600/30';
      case 'annual physical': return 'bg-amber-900/20 text-amber-400 border-amber-600/30';
      default: return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };
  
  const getColorForAppointmentStatus = (status: string) => {
    switch(status.toLowerCase()) {
      case 'checked in': return 'bg-green-700/30 text-green-400 border-green-600/40';
      case 'scheduled': return 'bg-blue-700/30 text-blue-400 border-blue-600/40';
      case 'canceled': return 'bg-red-900/20 text-red-400 border-red-700/30';
      case 'no-show': return 'bg-amber-900/20 text-amber-400 border-amber-700/30';
      case 'completed': return 'bg-slate-700/40 text-slate-400 border-slate-600/50';
      default: return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };
  
  // Enhanced appointments with more details
  const enhancedAppointments = appointments.map(appointment => ({
    ...appointment,
    duration: appointment.duration || '30 min',
    location: appointment.location || (Math.random() > 0.5 ? 'in-person' : 'virtual')
  }));
  
  // Filter appointments based on selected filter
  const filteredAppointments = filter === 'all' ? enhancedAppointments : 
    enhancedAppointments.filter(appointment => 
      filter === 'virtual' ? appointment.location === 'virtual' :
      filter === 'in-person' ? appointment.location === 'in-person' :
      filter === appointment.status.toLowerCase()
    );

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-autheo-primary">Provider Schedule</CardTitle>
            <CardDescription className="text-slate-300">
              Manage patient appointments and clinical schedule
            </CardDescription>
          </div>
          <Button onClick={onAction} className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900">
            <Plus className="h-4 w-4 mr-1.5" />
            New Appointment
          </Button>
        </div>
      </CardHeader>
      
      <div className="p-4 border-b border-slate-700 flex flex-wrap gap-3 bg-slate-700/20">
        <Tabs value={view} onValueChange={setView} className="flex-1">
          <TabsList className="bg-slate-700/50">
            <TabsTrigger value="day" className="data-[state=active]:bg-autheo-primary/90 data-[state=active]:text-slate-900">
              Day
            </TabsTrigger>
            <TabsTrigger value="week" className="data-[state=active]:bg-autheo-primary/90 data-[state=active]:text-slate-900">
              Week
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          {view === 'day' ? (
            <>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-slate-200 text-sm font-medium">{formatDate(currentDate)}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-slate-200 text-sm font-medium">
                {formatDate(getWeekDates()[0])} - {formatDate(getWeekDates()[6])}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] bg-slate-700/30 border-slate-600 text-slate-200">
            <SelectValue placeholder="Filter appointments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Appointments</SelectItem>
            <SelectItem value="checked in">Checked In</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="virtual">Virtual Visits</SelectItem>
            <SelectItem value="in-person">In-Person Visits</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <CardContent className="p-0">
        <TabsContent value="day" className="m-0">
          <div className="space-y-0">
            {timeSlots.map((time) => {
              const appointment = getAppointmentForTimeSlot(time);
              
              return (
                <div key={time} className={`border-b border-slate-700/50 p-3 flex ${appointment ? 'hover:bg-slate-700/20' : ''}`}>
                  <div className="w-20 flex-shrink-0 text-slate-400 text-sm">{time}</div>
                  
                  {appointment ? (
                    <div className="flex-1 ml-3">
                      <div className={`p-3 rounded-md ${getColorForAppointmentType(appointment.type)}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-slate-200">{appointment.patientName}</h4>
                            <p className="text-sm flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {time} ({(appointment as any).duration})
                              {(appointment as any).location === 'virtual' ? (
                                <Badge variant="outline" className="ml-2 bg-blue-900/20 text-blue-400 border-blue-600/30">
                                  <Video className="h-3 w-3 mr-1" /> Virtual
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="ml-2 bg-slate-700/40 text-slate-300">
                                  <MapPin className="h-3 w-3 mr-1" /> In-Person
                                </Badge>
                              )}
                            </p>
                          </div>
                          <Badge variant="outline" className={getColorForAppointmentStatus(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="mt-1 flex justify-between items-center">
                          <Badge variant="outline" className="bg-slate-700/40 text-slate-300">
                            {appointment.type}
                          </Badge>
                          <div className="flex gap-2">
                            {(appointment as any).location === 'virtual' ? (
                              <Button 
                                size="sm" 
                                className="h-7 bg-blue-700/40 hover:bg-blue-700/60 text-blue-200"
                                onClick={onAction}
                              >
                                <Video className="h-3.5 w-3.5 mr-1" />
                                Join
                              </Button>
                            ) : null}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 border-slate-600 hover:bg-slate-700"
                              onClick={onAction}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="flex-1 ml-3 border border-dashed border-slate-700/50 rounded-md flex items-center justify-center h-12 cursor-pointer hover:bg-slate-700/20"
                      onClick={onAction}
                    >
                      <span className="text-slate-500 text-sm">Available</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="week" className="m-0">
          <div className="grid grid-cols-7 border-b border-slate-700/50">
            {getWeekDates().map((date, index) => (
              <div 
                key={index} 
                className={`p-2 text-center ${date.toDateString() === new Date().toDateString() ? 'bg-autheo-primary/10' : ''}`}
              >
                <div className="text-sm font-medium text-slate-200">{daysOfWeek[date.getDay()].substring(0, 3)}</div>
                <div className={`text-2xl mt-1 ${date.toDateString() === new Date().toDateString() ? 'text-autheo-primary' : 'text-slate-300'}`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 border-b border-slate-700/50">
            {getWeekDates().map((date, index) => {
              const appointmentsOnDay = filteredAppointments.filter(() => Math.random() > 0.7);
              const hasAppointments = appointmentsOnDay.length > 0;
              
              return (
                <div 
                  key={index}
                  className={`p-2 min-h-[100px] border-r border-slate-700/50 ${index === 6 ? 'border-r-0' : ''} ${date.toDateString() === new Date().toDateString() ? 'bg-autheo-primary/5' : ''}`}
                >
                  {hasAppointments ? (
                    <div className="space-y-2">
                      {appointmentsOnDay.map((appointment, i) => (
                        <div 
                          key={`${appointment.id}-${i}`}
                          className={`p-1.5 rounded text-xs ${getColorForAppointmentType(appointment.type)}`}
                          onClick={onAction}
                        >
                          <div className="font-medium">{appointment.time}</div>
                          <div className="truncate">{appointment.patientName}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="h-full flex items-center justify-center text-slate-500 text-sm cursor-pointer hover:bg-slate-700/20 rounded"
                      onClick={onAction}
                    >
                      <span>No appointments</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </CardContent>
      
      <CardFooter className="bg-slate-700/30 border-t border-slate-700 px-4 py-3 text-xs text-slate-400 flex justify-between">
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-1.5 text-autheo-primary" />
          Schedule synchronized with EHR system
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1.5 text-autheo-primary" />
          {filteredAppointments.length} appointments today
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProviderCalendar;
