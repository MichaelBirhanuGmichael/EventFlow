import React, { useEffect, useState } from 'react';
import { getEvents } from '../api/events';

interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  // Add other relevant fields from your event model
}

const UpcomingEventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents: Event[] = await getEvents();

        // Filter and sort upcoming events
        const now = new Date();
        const upcoming = fetchedEvents.filter(event => new Date(event.end_time) >= now);
        upcoming.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

        setEvents(upcoming);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div>Loading upcoming events...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Upcoming Events</h2>
      {events.length === 0 ? (
        <p>No upcoming events found.</p>
      ) : (
        <ul>
          {events.map(event => (
            <li key={event.id}>
              <strong>{event.title}</strong> - {new Date(event.start_time).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpcomingEventsList; 