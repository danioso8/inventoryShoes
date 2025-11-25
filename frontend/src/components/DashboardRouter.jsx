import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function DashboardRouter() {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si es owner o admin, va al dashboard administrativo
  if (user.role === 'owner' || user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // Si es vendedor o solo_lectura, va al dashboard de vendedor
  if (user.role === 'vendedor' || user.role === 'solo_lectura') {
    return <Navigate to="/seller/dashboard" replace />;
  }

  // Por defecto, al dashboard administrativo
  return <Navigate to="/admin/dashboard" replace />;
}

export default DashboardRouter;
