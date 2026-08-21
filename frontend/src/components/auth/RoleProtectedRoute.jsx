import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function RoleProtectedRoute({ allowedRoles }) {
  const { user, isCheckingSession } = useAuth();

  if (isCheckingSession) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role?.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;
