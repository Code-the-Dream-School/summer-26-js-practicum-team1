import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import AppContext from '../../context/AppContext';

function AdminProtectedRoute() {
  const { user, isLoading } = useContext(AppContext);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;
