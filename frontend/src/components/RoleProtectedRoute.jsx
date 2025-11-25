import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function RoleProtectedRoute({ children, allowedRoles }) {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si no se especifican roles permitidos, permitir a todos los autenticados
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // Verificar si el rol del usuario está en los roles permitidos
  if (allowedRoles.includes(user.role)) {
    return children;
  }

  // Si no tiene permiso, redirigir al dashboard apropiado
  if (user.role === 'owner' || user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <Navigate to="/seller/dashboard" replace />;
}

export default RoleProtectedRoute;
