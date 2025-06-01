import React, { useEffect, useState } from 'react';
import Calendar from '../components/Calendar';
import { getEvents, getEventOccurrences } from '../api/events';

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await getEvents();
        const allCalendarEvents: any[] = [];

        for (const event of fetchedEvents) {
          if (event.recurrence_rule) {
            // Fetch occurrences for recurring events
            try {
              const occurrences = await getEventOccurrences(event.id, 50); // Fetch up to 50 occurrences
              occurrences.forEach((occurrence: any) => {
                allCalendarEvents.push({
                  title: event.title,
                  start: occurrence.start_time,
                  end: occurrence.end_time,
                  // Add other event details if needed
                });
              });
            } catch (occurrenceError) {
              console.error(`Error fetching occurrences for event ${event.id}:`, occurrenceError);
              // Optionally add the base event as a fallback
               allCalendarEvents.push({
                 title: event.title,
                 start: event.start_time,
                 end: event.end_time,
               });
            }
          } else {
            // Add single events directly
            allCalendarEvents.push({
              title: event.title,
              start: event.start_time,
              end: event.end_time,
              // Add other event details if needed
            });
          }
        }
        setEvents(allCalendarEvents);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Calendar</h1>
      <Calendar events={events} />
    </div>
  );
};

export default CalendarPage; 