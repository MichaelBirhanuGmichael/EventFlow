import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventDropArg } from '@fullcalendar/core';
import './calendar.css';

/**
 * Props for the Calendar component, integrating FullCalendar for event scheduling.
 */
interface CalendarProps {
  /** List of events to display on the calendar */
  events?: any[];
  /** Callback triggered when an event is clicked */
  onEventClick?: (arg: EventClickArg) => void;
  /** Callback triggered when an event is dragged and dropped */
  onEventDrop?: (arg: EventDropArg) => void;
  /** Height of the calendar (defaults to 'auto') */
  height?: string | number;
}

/**
 * Calendar component for displaying and interacting with events.
 * Supports viewing events in a monthly grid, editing via drag-and-drop, and clicking for further actions.
 * @param props - Component props including events and interaction callbacks.
 */
const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onEventClick,
  onEventDrop,
  height = 'auto',
}) => {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      editable={true}
      selectable={true}
      events={events}
      height={height}
      eventClick={onEventClick}
      eventDrop={onEventDrop}
    />
  );
};

export default Calendar;