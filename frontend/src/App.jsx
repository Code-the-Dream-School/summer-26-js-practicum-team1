import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import VolunteerApprovals from './pages/admin/VolunteerApprovals';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>
      {/* Admin routes */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/volunteers" element={<VolunteerApprovals />} />
      </Route>
    </Routes>
  );
}

export default App;
