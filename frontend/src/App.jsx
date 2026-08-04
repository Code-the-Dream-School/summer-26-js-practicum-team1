import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>
    </Routes>
  );
}

export default App;
