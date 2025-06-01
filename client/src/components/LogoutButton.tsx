import React from 'react';
import { useAuth } from '../context/AuthContext';

const LogoutButton: React.FC = () => {
  const { logout, user } = useAuth();
  if (!user) return null;
  return <button onClick={logout}>Logout</button>;
};

export default LogoutButton; 