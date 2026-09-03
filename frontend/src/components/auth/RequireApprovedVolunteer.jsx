import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function RequireApprovedVolunteer() {
  const { user } = useAuth();

  if (
    user?.role?.toLowerCase() === 'volunteer' &&
    user?.verificationStatus === 'pending'
  ) {
    return <Navigate to="/volunteer-pending" replace />;
  }

  return <Outlet />;
}

export default RequireApprovedVolunteer;
