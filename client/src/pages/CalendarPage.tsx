import React, { useEffect, useState } from 'react';
import Calendar from '../components/Calendar';
import { getEvents } from '../api/events';

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    getEvents().then(setEvents).catch(() => setEvents([]));
  }, []);

  return (
    <div>
      <h1>Calendar</h1>
      <Calendar events={events} />
    </div>
  );
};

export default CalendarPage; 