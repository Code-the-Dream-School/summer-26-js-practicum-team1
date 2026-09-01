import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import SignupPage from './pages/SignupPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import VolunteerApprovals from './pages/admin/VolunteerApprovals';
import UsersList from './pages/admin/UsersList';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';

import RequesterDashboard from './pages/Requester/RequesterDashboard';
import RequestorRegistration from './pages/Register';
import VolunteerRegistrationPage from './pages/VolunteerRegistrationPage';
import Browse from './pages/Browse';
import ProfilePage from './pages/ProfilePage';
import NewhelpRequest from './pages/Requester/helpRequest';
import VolunteerPendingPage from './pages/VolunteerPendingPage';
import ChatPage from './pages/ChatPage';

import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignupPage />} />

        {/* Requester Registration */}
        <Route
          path="requesterRegistration"
          element={<RequestorRegistration />}
        />

        {/* General Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="volunteer-pending" element={<VolunteerPendingPage />} />
          <Route element={<RequireApprovedVolunteer />}>
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Requester Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['requester']} />}>
          <Route path="requester-dashboard" element={<RequesterDashboard />} />
          <Route path="helpRequest" element={<NewhelpRequest />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/volunteers" element={<VolunteerApprovals />} />
          <Route path="admin/users/:id" element={<AdminUserDetailPage />} />
          <Route path="admin/users" element={<UsersList />} />
        </Route>

        {/* Chat routes */}
        <Route
          element={
            <RoleProtectedRoute allowedRoles={['volunteer', 'requester']} />
          }
        >
          <Route path="/chat/:requestId" element={<ChatPage />} />
        </Route>

        {/* Placeholder for future routes to volunteer registration and requestor registration pages */}
        {/* <Route path="volunteerRegistration" element={<VolunteerRegistration/>}/> */}
        {/* <Route path="requesterRegistration" element={<RequestorRegistration/>}/> */}

        {/* Volunteer Routes */}
        <Route
          element={<RoleProtectedRoute allowedRoles={['volunteer', 'admin']} />}
        >
          <Route element={<RequireApprovedVolunteer />}>
            <Route path="browse" element={<Browse />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
