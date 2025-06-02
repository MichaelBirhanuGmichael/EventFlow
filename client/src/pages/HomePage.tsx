import React from 'react';
import UpcomingEventsList from '../components/UpcomingEventsList';
import { Box, Typography, GridLegacy as Grid } from '@mui/material';

/**
 * HomePage component serves as the main landing page of the application.
 * It displays a welcome message and a list of upcoming events.
 */
const HomePage: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to EventFlow
      </Typography>
      <Typography variant="body1" gutterBottom>
        This is the home page where you can see your upcoming events.
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <UpcomingEventsList />
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Reserved for future features such as a calendar preview */}
        </Grid>


      </Grid>
    </Box>
  );
};

export default HomePage;