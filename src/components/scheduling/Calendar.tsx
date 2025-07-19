
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAppointments } from '@/hooks/useAppointments';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  provider: string;
  type: string;
  location?: string;
}

interface CalendarProps {
  onDateSelect?: (date: Date | undefined) => void;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  onDateSelect,
  className
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { appointments, loading } = useAppointments();

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Convert appointments to calendar events format
  const events: CalendarEvent[] = appointments.map(apt => ({
    id: apt.id,
    title: `${apt.type} - ${apt.provider}`,
    date: new Date(apt.appointment_date || apt.date),
    time: apt.time,
    provider: apt.provider,
    type: apt.type,
    location: apt.location
  }));

  // Filter events for the selected date
  const selectedDateEvents = events.filter(event => 
    selectedDate && 
    format(new Date(event.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  // Get dates that have events for highlighting in calendar
  const eventDates = events.map(event => new Date(event.date));

  if (loading) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 text-slate-100 ${className}`}>
        <CardHeader>
          <CardTitle className="text-autheo-primary">Appointment Calendar</CardTitle>
          <CardDescription className="text-slate-300">
            Loading your appointments...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autheo-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 text-slate-100 ${className}`}>
      <CardHeader>
        <CardTitle className="text-autheo-primary">Your Appointment Calendar</CardTitle>
        <CardDescription className="text-slate-300">
          View your scheduled appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex justify-center">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="border border-slate-700 rounded-md p-3 pointer-events-auto bg-slate-800/30"
              modifiers={{
                eventDay: (date) => 
                  eventDates.some(eventDate => format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
              }}
              modifiersStyles={{
                eventDay: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  backgroundColor: 'rgba(94, 235, 196, 0.15)',
                  color: '#5EEBC4'
                }
              }}
            />
          </div>
          <div className="flex-1">
            <div>
              <h3 className="text-lg font-medium mb-3 text-autheo-primary">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
              </h3>
              
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="p-3 border border-slate-700 bg-slate-800/30 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge variant="outline" className="bg-autheo-primary/10 text-autheo-primary border-autheo-primary/20">
                          {event.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-300">
                        <p>{event.time} • {event.provider}</p>
                        {event.location && <p>{event.location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No appointments scheduled for this day</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar;
