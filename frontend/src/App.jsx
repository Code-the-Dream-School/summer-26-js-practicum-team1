import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import VolunteerApprovals from './pages/admin/VolunteerApprovals';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />

        {/* Admin routes */}
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/volunteers" element={<VolunteerApprovals />} />
      </Route>
    </Routes>
  );
}

export default App;
