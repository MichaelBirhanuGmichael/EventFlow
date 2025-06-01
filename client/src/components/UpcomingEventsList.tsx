import React, { useEffect, useState, type SyntheticEvent } from 'react';
import { getEvents, deleteEvent } from '../api/events';
import { List, ListItem, ListItemText, Typography, Box, CircularProgress, Alert, IconButton, Snackbar } from '@mui/material';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const handleDelete = async (eventId: number) => {
    try {
      await deleteEvent(eventId);
      // Remove the deleted event from the state
      setEvents(events.filter(event => event.id !== eventId));
      setSnackbarMessage('Event deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error(`Error deleting event ${eventId}:`, err);
      setSnackbarMessage(`Failed to delete event: ${err.message || 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Upcoming Events</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && events.length === 0 && (
        <Typography>No upcoming events found.</Typography>
      )}
      {!loading && !error && events.length > 0 && (
        <List>
          {events.map(event => (
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
      {/* @ts-expect-error: Type incompatibility with Material UI Snackbar onClose prop */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpcomingEventsList; 