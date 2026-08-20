import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import VolunteerApprovals from './pages/admin/VolunteerApprovals';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
import UsersList from './pages/admin/UsersList';
import Login from './pages/Login';
import SignupPage from './pages/SignupPage';
import RequestorRegistration from './pages/Register';
import Browse from './pages/Browse';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<Login />} />

        {/* Admin routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/volunteers" element={<VolunteerApprovals />} />
          <Route path="admin/users" element={<UsersList />} />
        </Route>
        <Route path="signup" element={<SignupPage />} />
        {/* Placeholder for future routes to volunteer registration and requestor registration pages */}
        {/* <Route path="volunteerRegistration" element={<VolunteerRegistration/>}/> */}
        <Route
          path="requesterRegistration"
          element={<RequestorRegistration />}
        />
        <Route
          element={<RoleProtectedRoute allowedRoles={['volunteer', 'admin']} />}
        >
          <Route path="browse" element={<Browse />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
