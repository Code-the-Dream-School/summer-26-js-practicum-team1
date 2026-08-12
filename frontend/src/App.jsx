import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import VolunteerApprovals from './pages/admin/VolunteerApprovals';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import RequesterProtectedRoute from './components/auth/RequesterProtectedRoute';
import UsersList from './pages/admin/UsersList';
import Login from './pages/Login';
import SignupPage from './pages/SignupPage';
import RequesterProfile from './pages/RequesterProfile';

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
        </Route>
        <Route path="signup" element={<SignupPage />} />
        {/* Placeholder for future routes to volunteer registration and requestor registration pages */}
        {/* <Route path="volunteerRegistration" element={<VolunteerRegistration/>}/> */}
        {/* <Route path="requesterRegistration" element={<RequestorRegistration/>}/> */}
      </Route>
      <Route element={<RequesterProtectedRoute />}>
        {/* Requester Routes */}
        {/* TODO: Move profile route inside requester dashboard once ready */}
        <Route path="profile" element={<RequesterProfile />} />
      </Route>
    </Routes>
  );
}

export default App;
