
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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
  events: CalendarEvent[];
  onDateSelect?: (date: Date | undefined) => void;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  events,
  onDateSelect,
  className
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Filter events for the selected date
  const selectedDateEvents = events.filter(event => 
    selectedDate && 
    format(new Date(event.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  // Get dates that have events for highlighting in calendar
  const eventDates = events.map(event => new Date(event.date));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Appointment Calendar</CardTitle>
        <CardDescription>
          View and manage upcoming appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex justify-center">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="border rounded-md p-3 pointer-events-auto"
              modifiers={{
                eventDay: (date) => 
                  eventDates.some(eventDate => format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
              }}
              modifiersStyles={{
                eventDay: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  backgroundColor: 'rgba(155, 135, 245, 0.1)', // Light purple
                  color: '#9b87f5' // Primary purple
                }
              }}
            />
          </div>
          <div className="flex-1">
            <div>
              <h3 className="text-lg font-medium mb-3">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
              </h3>
              
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <p>{event.time} • {event.provider}</p>
                        {event.location && <p>{event.location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No appointments scheduled for this day</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar;
