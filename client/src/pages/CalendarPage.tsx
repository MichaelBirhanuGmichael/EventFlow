import React, { useEffect, useState } from 'react';
import Calendar from '../components/Calendar';
import EventForm, { type EventFormValues } from '../components/EventForm';
import { getEvents, getEventOccurrences, getEvent, updateEvent, deleteEvent, deleteOccurrence, createEvent } from '../api/events';
import { Box, Typography, CircularProgress, Alert, Modal, Backdrop, Fade, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { EventClickArg, EventDropArg } from '@fullcalendar/core';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '80vh',
  overflowY: 'auto',
};

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

  useEffect(() => {
    fetchEvents();
  }, []);

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
            console.error(`Error fetching occurrences for event ${event.id}:`, occurrenceError);
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
      setError(err.message || 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

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
        console.error('Error fetching event details for editing:', err);
      }
    }
  };

  const handleEditSubmit = async (values: EventFormValues) => {
    if (selectedEventId === null) return;
    try {
      await updateEvent(selectedEventId, values);
      handleCloseEditModal();
      fetchEvents();
    } catch (err) {
      console.error('Error updating event:', err);
    }
  };

  const handleCreateSubmit = async (values: EventFormValues) => {
    try {
      await createEvent(values);
      handleCloseCreateModal();
      fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  const handleDeleteSeries = async () => {
    if (eventToDelete?.id === undefined) return;
    try {
      await deleteEvent(eventToDelete.id);
      handleCloseDeleteConfirm();
      fetchEvents();
    } catch (err) {
      console.error(`Error deleting event series ${eventToDelete.id}:`, err);
    }
  };

  const handleDeleteInstance = async () => {
    if (eventToDelete?.id === undefined || !eventToDelete.start) return;
    try {
      await deleteOccurrence(eventToDelete.id, eventToDelete.start);
      handleCloseDeleteConfirm();
      fetchEvents();
    } catch (err) {
      console.error(`Error deleting event occurrence ${eventToDelete.id} at ${eventToDelete.start}:`, err);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedEventId(null);
    setEditingEvent(null);
  };

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setEventToDelete(null);
  };

  const handleEventDrop = async (arg: EventDropArg) => {
    console.log('Event dropped:', arg.event);
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
      }

      await updateEvent(updatedEvent.id, eventToUpdate);
      console.log('Event updated in backend:', eventToUpdate);
      fetchEvents();
    } catch (error) {
      console.error('Error dropping event:', error);
      arg.revert();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Calendar</Typography>

      <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateModal} sx={{ mb: 2 }}>
        Create New Event
      </Button>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <Calendar events={events} onEventClick={handleEventClick} onEventDrop={handleEventDrop} />
      )}

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
            <Typography id="edit-event-modal-title" variant="h6" component="h2">
              Edit Event
            </Typography>
            {editingEvent && <EventForm onSubmit={handleEditSubmit} initialValues={editingEvent} />}
          </Box>
        </Fade>
      </Modal>

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
            <Typography id="create-event-modal-title" variant="h6" component="h2">
              Create New Event
            </Typography>
            <EventForm onSubmit={handleCreateSubmit} />
          </Box>
        </Fade>
      </Modal>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          {eventToDelete?.isRecurringInstance ? (
            <DialogContentText id="delete-dialog-description">
              This is a recurring event instance. Do you want to delete just this instance or the entire series?
            </DialogContentText>
          ) : (
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete this event?
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          {eventToDelete?.isRecurringInstance && (
            <Button onClick={handleDeleteInstance} color="secondary">Delete Instance</Button>
          )}
          <Button onClick={handleDeleteSeries} color="error" autoFocus>Delete Series</Button>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage; 