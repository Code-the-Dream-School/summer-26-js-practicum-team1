import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import SignupPage from './pages/SignupPage';

import RequestorRegistration from './pages/Register';

import RequesterDashboard from './pages/Requester/RequesterDashboard';
import NewhelpRequest from './pages/Requester/helpRequest';

import ProfilePage from './pages/ProfilePage';

import AdminDashboard from './pages/admin/AdminDashboard';
import VolunteerApprovals from './pages/admin/VolunteerApprovals';
import UsersList from './pages/admin/UsersList';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';

import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import RequesterProtectedRoute from './components/auth/RequesterProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<Login />} />

        <Route path="signup" element={<SignupPage />} />
        {/*requester routes*/}


        <Route
          path="requesterRegistration"
          element={<RequestorRegistration />}
        />



  <Route element={<RequesterProtectedRoute />}>
  <Route path="requester-dashboard" element={<RequesterDashboard />}/>
  <Route path="helpRequest" element={<NewhelpRequest />} />
  </Route>
  
        {/* Admin routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/volunteers" element={<VolunteerApprovals />} />
          <Route path="admin/users" element={<UsersList />} />
          <Route path="admin/users/:id"element={<AdminUserDetailPage />}/>
        </Route>

        {/* General authenticated routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Placeholder for future routes to volunteer registration and requestor registration pages */}
        {/* <Route path="volunteerRegistration" element={<VolunteerRegistration/>}/> */}
      </Route>
    </Routes>
  );
}

export default App;