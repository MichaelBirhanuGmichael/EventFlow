import React, { useEffect, useState } from 'react';
import { getEvents, deleteEvent } from '../api/events';
import { List, ListItem, ListItemText, Typography, Box, CircularProgress, Alert, IconButton, Snackbar } from '@mui/material';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';

/**
 * Represents an event in the upcoming events list.
 */
interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
}

/**
 * UpcomingEventsList component for displaying and managing upcoming events.
 * Displays a list of upcoming events (US-07) with the ability to delete events (US-09).
 */
const UpcomingEventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

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
   * Fetches events from the API and filters for upcoming events.
   * Sorts events by start time to ensure chronological order (US-07).
   */
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const fetchedEvents = await getEvents();
      // Filter events to show only upcoming ones and sort by start time
      const now = new Date();
      const upcoming = fetchedEvents
        .filter((event: Event) => new Date(event.end_time) >= now)
        .sort((a: Event, b: Event) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      setEvents(upcoming);
    } catch (err: any) {
      // Skip error handling for 401 errors if the user is already unauthenticated
      if (!(err.response && err.response.status === 401 && !isAuthenticated)) {
        setError(err.message || 'Failed to fetch events');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes an event by ID and updates the UI with a success/error notification.
   * Supports event deletion requirement (US-09).
   * @param eventId - The ID of the event to delete.
   */
  const handleDelete = async (eventId: number) => {
    try {
      await deleteEvent(eventId);
      setEvents(events.filter((event) => event.id !== eventId));
      setSnackbarMessage('Event deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarMessage(`Failed to delete event: ${err.message || 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  /**
   * Closes the snackbar unless the user clicks away.
   * @param _event - The event triggering the close (optional).
   * @param reason - The reason for closing the snackbar (optional).
   */
  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading || authLoading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Upcoming Events</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {!error && events.length === 0 && <Typography>No upcoming events found.</Typography>}
      {!error && events.length > 0 && (
        <List>
          {events.map((event) => (
            <ListItem
              key={event.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(event.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={event.title}
                secondary={new Date(event.start_time).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      )}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpcomingEventsList;