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
import Browse from './pages/Browse';
import ProfilePage from './pages/ProfilePage';
import NewhelpRequest from './pages/Requester/helpRequest';
import ChatPage from './pages/ChatPage';
import About from './pages/About';
import Contact from './pages/Contact';

import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignupPage />} />

        {/* Requester Registration */}
        <Route
          path="requesterRegistration"
          element={<RequestorRegistration />}
        />

        {/* General Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
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
          <Route path="admin/users" element={<UsersList />} />
          <Route path="admin/users/:id" element={<AdminUserDetailPage />} />
        </Route>

        {/* Chat routes */}
        <Route
          element={
            <RoleProtectedRoute allowedRoles={['volunteer', 'requester']} />
          }
        >
          <Route path="/chat/:requestId" element={<ChatPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* Placeholder for future routes to volunteer registration and requestor registration pages */}
        {/* <Route path="volunteerRegistration" element={<VolunteerRegistration/>}/> */}
        {/* <Route path="requesterRegistration" element={<RequestorRegistration/>}/> */}
        {/* VolunteerDashbord Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={['volunteer']} />}>
          <Route path="volunteer-dashboard" element={<VolunteerDashboard />} />
        </Route>
        {/* Volunteer Routes */}
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
