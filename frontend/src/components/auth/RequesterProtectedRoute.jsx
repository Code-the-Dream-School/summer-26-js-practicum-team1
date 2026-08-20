import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function RequesterProtectedRoute() {
  const { user, isCheckingSession } = useAuth();

  if (isCheckingSession) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user?.role?.toLowerCase() !== 'requester') {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}

export default RequesterProtectedRoute;
