import React, { useEffect, useState } from 'react';
import Calendar from '../components/Calendar';
import EventForm, { type EventFormValues } from '../components/EventForm';
import { getEvents, getEventOccurrences, getEvent, updateEvent, deleteEvent, deleteOccurrence, createEvent } from '../api/events';
import { Box, Typography, CircularProgress, Alert, Modal, Backdrop, Fade, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { EventClickArg, EventDropArg } from '@fullcalendar/core';
import { useAuth } from '../context/AuthContext';

/**
 * Modal styling for event creation and editing forms.
 */
const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '80vh',
  overflowY: 'auto',
};

/**
 * CalendarPage component for managing events on a calendar view.
 * Supports event creation with recurrence (US-01 to US-05), calendar viewing (US-06),
 * editing via click or drag-and-drop (US-08), and deletion of events or instances (US-09).
 */
const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventFormValues | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: number; isRecurringInstance?: boolean; start?: string } | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchEvents();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setEvents([]);
      setError('Please log in to view events.');
    }
  }, [isAuthenticated, authLoading]);

  /**
   * Fetches events and expands recurring events into occurrences for display (US-06).
   * Handles both one-off and recurring events by calling the appropriate API endpoints.
   */
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const fetchedEvents = await getEvents();
      const allCalendarEvents: any[] = [];

      for (const event of fetchedEvents) {
        if (event.recurrence_rule) {
          try {
            const occurrences = await getEventOccurrences(event.id, 50);
            occurrences.forEach((occurrence: any) => {
              allCalendarEvents.push({
                id: event.id,
                title: event.title,
                start: occurrence.start,
                end: occurrence.end,
                isRecurringInstance: occurrence.is_recurring_instance,
              });
            });
          } catch (occurrenceError) {
            // Fallback to base event if occurrences cannot be fetched
            allCalendarEvents.push({
              id: event.id,
              title: event.title,
              start: event.start_time,
              end: event.end_time,
            });
          }
        } else {
          allCalendarEvents.push({
            id: event.id,
            title: event.title,
            start: event.start_time,
            end: event.end_time,
          });
        }
      }
      setEvents(allCalendarEvents);
    } catch (err: any) {
      if (!(err.response && err.response.status === 401 && !isAuthenticated)) {
        setError(err.message || 'Failed to fetch events');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles event clicks to either open the edit modal or prompt for deletion.
   * For recurring instances, prompts for deletion (US-09); otherwise, opens edit form (US-08).
   * @param arg - Event click argument from FullCalendar.
   */
  const handleEventClick = async (arg: EventClickArg) => {
    if (arg.event.extendedProps?.isRecurringInstance) {
      setEventToDelete({ id: Number(arg.event.id), isRecurringInstance: true, start: arg.event.start?.toISOString() });
      setDeleteConfirmOpen(true);
    } else {
      setSelectedEventId(Number(arg.event.id));
      try {
        const eventDetails = await getEvent(Number(arg.event.id));
        setEditingEvent({
          title: eventDetails.title,
          start_time: eventDetails.start_time,
          end_time: eventDetails.end_time,
          is_all_day: eventDetails.is_all_day,
          description: eventDetails.description,
          recurrence_rule: eventDetails.recurrence_rule || null,
        });
        setEditModalOpen(true);
      } catch (err) {
        setError('Failed to fetch event details for editing.');
      }
    }
  };

  /**
   * Submits updated event data and refreshes the calendar (US-08).
   * @param values - Updated event form values.
   */
  const handleEditSubmit = async (values: EventFormValues) => {
    if (selectedEventId === null) return;
    if (!isAuthenticated) {
      setError('You must be logged in to edit events.');
      return;
    }
    try {
      await updateEvent(selectedEventId, values);
      handleCloseEditModal();
      fetchEvents();
    } catch (err) {
      setError('Failed to update event.');
    }
  };

  /**
   * Submits new event data and refreshes the calendar (US-01 to US-05).
   * @param values - New event form values.
   */
  const handleCreateSubmit = async (values: EventFormValues) => {
    if (!isAuthenticated) {
      setError('You must be logged in to create events.');
      return;
    }
    try {
      await createEvent(values);
      handleCloseCreateModal();
      fetchEvents();
    } catch (err) {
      setError('Failed to create event.');
    }
  };

  /**
   * Deletes an entire event series and refreshes the calendar (US-09).
   */
  const handleDeleteSeries = async () => {
    if (eventToDelete?.id === undefined) return;
    if (!isAuthenticated) {
      setError('You must be logged in to delete events.');
      handleCloseDeleteConfirm();
      return;
    }
    try {
      await deleteEvent(eventToDelete.id);
      handleCloseDeleteConfirm();
      fetchEvents();
    } catch (err) {
      setError('Failed to delete event series.');
    }
  };

  /**
   * Deletes a specific occurrence of a recurring event and refreshes the calendar (US-09).
   */
  const handleDeleteInstance = async () => {
    if (eventToDelete?.id === undefined || !eventToDelete.start) return;
    if (!isAuthenticated) {
      setError('You must be logged in to delete event instances.');
      handleCloseDeleteConfirm();
      return;
    }
    try {
      await deleteOccurrence(eventToDelete.id, eventToDelete.start);
      handleCloseDeleteConfirm();
      fetchEvents();
    } catch (err) {
      setError('Failed to delete event instance.');
    }
  };

  /**
   * Closes the edit modal and resets related state.
   */
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedEventId(null);
    setEditingEvent(null);
    setError(null);
  };

  /**
   * Opens the create event modal.
   */
  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  /**
   * Closes the create event modal and clears errors.
   */
  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setError(null);
  };

  /**
   * Closes the delete confirmation dialog and resets related state.
   */
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setEventToDelete(null);
    setError(null);
  };

  /**
   * Handles drag-and-drop updates to event times and refreshes the calendar (US-08).
   * Reverts the change if the update fails.
   * @param arg - Event drop argument from FullCalendar.
   */
  const handleEventDrop = async (arg: EventDropArg) => {
    if (!isAuthenticated) {
      setError('You must be logged in to move events.');
      arg.revert();
      return;
    }
    try {
      const updatedEvent = {
        id: Number(arg.event.id),
        start_time: arg.event.start?.toISOString(),
        end_time: arg.event.end?.toISOString(),
      };
      const currentEventDetails = await getEvent(updatedEvent.id);

      const eventToUpdate = {
        ...currentEventDetails,
        start_time: updatedEvent.start_time,
        end_time: updatedEvent.end_time,
      };

      await updateEvent(updatedEvent.id, eventToUpdate);
      fetchEvents();
    } catch (error) {
      setError('Failed to move event.');
      arg.revert();
    }
  };

  if (loading || authLoading) {
    return <CircularProgress />;
  }

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        width: '100%',
        maxWidth: { xs: '100%', sm: 600, md: 900 },
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography variant="h4" gutterBottom align="center">Calendar</Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpenCreateModal}
        sx={{ mb: 2, alignSelf: 'center' }}
        disabled={!isAuthenticated || authLoading}
      >
        Create New Event
      </Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ width: '100%', minWidth: 0 }}>
        <Calendar
          events={events}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
          height="auto"
        />
      </Box>

      <Modal
        aria-labelledby="create-event-modal-title"
        aria-describedby="create-event-modal-description"
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={createModalOpen}>
          <Box sx={style}>
            <EventForm onSubmit={handleCreateSubmit} submitText="Create" />
          </Box>
        </Fade>
      </Modal>

      <Modal
        aria-labelledby="edit-event-modal-title"
        aria-describedby="edit-event-modal-description"
        open={editModalOpen}
        onClose={handleCloseEditModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={editModalOpen}>
          <Box sx={style}>
            {editingEvent && <EventForm initialValues={editingEvent} onSubmit={handleEditSubmit} submitText="Update" />}
          </Box>
        </Fade>
      </Modal>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="delete-confirm-dialog-title"
        aria-describedby="delete-confirm-dialog-description"
      >
        <DialogTitle id="delete-confirm-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirm-dialog-description">
            Are you sure you want to delete this {eventToDelete?.isRecurringInstance ? 'event occurrence' : 'event series'}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={eventToDelete?.isRecurringInstance ? handleDeleteInstance : handleDeleteSeries} autoFocus color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;