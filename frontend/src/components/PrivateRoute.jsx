import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

// Componente para proteger rutas que requieren autenticación
const PrivateRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default PrivateRoute;
