import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import VolunteerApprovals from './pages/admin/VolunteerApprovals';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import RequesterProtectedRoute from './components/auth/RequesterProtectedRoute';
import UsersList from './pages/admin/UsersList';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import Login from './pages/Login';
import SignupPage from './pages/SignupPage';
import RequestorRegistration from './pages/Register';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<Login />} />

        {/* Admin routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/volunteers" element={<VolunteerApprovals />} />
          <Route path="admin/users" element={<UsersList />} />
          <Route path="admin/users/:id" element={<AdminUserDetailPage />} />
        </Route>
        <Route path="signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        {/* Placeholder for future routes to volunteer registration and requestor registration pages */}
        {/* <Route path="volunteerRegistration" element={<VolunteerRegistration/>}/> */}
        {/* <Route path="requesterRegistration" element={<RequestorRegistration/>}/> */}
        <Route element={<RequesterProtectedRoute />}>
          {/* Requester Routes */}
          {/* TODO: Move profile route inside requester dashboard once ready */}
        </Route>
        <Route
          path="requesterRegistration"
          element={<RequestorRegistration />}
        />
      </Route>
    </Routes>
  );
}

export default App;
