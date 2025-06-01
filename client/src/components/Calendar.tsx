import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventDropArg } from '@fullcalendar/core'; // Import types from @fullcalendar/core
import './/calendar.css'; // Import custom calendar styles
// Remove explicit CSS imports as FullCalendar v6 injects styles
// import '@fullcalendar/react/main.css';
// import '@fullcalendar/core/main.css';
// import '@fullcalendar/daygrid/main.css';
// import '@fullcalendar/timegrid/main.css';

interface CalendarProps {
  events?: any[];
  onEventClick?: (arg: EventClickArg) => void;
  onEventDrop?: (arg: EventDropArg) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events = [], onEventClick, onEventDrop }) => {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      editable={true}
      selectable={true}
      events={events}
      height="auto"
      eventClick={onEventClick}
      eventDrop={onEventDrop}
    />
  );
};

export default Calendar;