import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import RegisterPage from './features/auth/RegisterPage';
import LoginPage from './features/auth/LoginPage';
import EventsPage from './features/events/EventsPage';
import CreateEventPage from './features/events/CreateEventPage';
import EditEventPage from './features/events/EditEventPage';
import MyRegistrationsPage from './features/events/MyRegistrationsPage';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for cross-tab logout events
    const handleCrossTabLogout = (event: CustomEvent) => {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('department');

      // Show notification
      toast.error(event.detail.message || 'Logged out from another tab');

      // Redirect to login
      navigate('/login');
    };

    window.addEventListener('cross-tab-logout', handleCrossTabLogout as EventListener);

    return () => {
      window.removeEventListener('cross-tab-logout', handleCrossTabLogout as EventListener);
    };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/create" element={<CreateEventPage />} />
      <Route path="/events/edit/:id" element={<EditEventPage />} />
      <Route path="/my-registrations" element={<MyRegistrationsPage />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
