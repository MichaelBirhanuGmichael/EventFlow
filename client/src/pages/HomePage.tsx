import React from 'react';
import UpcomingEventsList from '../components/UpcomingEventsList';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to EventFlow</h1>
      <p>This is the home page.</p>
      <UpcomingEventsList />
    </div>
  );
};

export default HomePage; 