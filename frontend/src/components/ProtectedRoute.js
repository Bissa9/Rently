import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  // While still checking if user is logged in
  if (user === undefined) {
    return <div>Loading...</div>; 
  }

  // If user is not logged in
  if (user === null) {
    return <Navigate to="/login" />;
  }

  // If user is logged in
  return children;
};

export default ProtectedRoute;
