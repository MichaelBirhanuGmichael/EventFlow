import React from 'react';
import UpcomingEventsList from '../components/UpcomingEventsList';
import { Box, Typography, Grid } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>Welcome to EventFlow</Typography>
      <Typography variant="body1" gutterBottom>This is the home page where you can see your upcoming events.</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          
        </Grid>
        <Grid item xs={12} md={4}>
          <UpcomingEventsList />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage; 