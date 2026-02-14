import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './features/auth/RegisterPage';
import LoginPage from './features/auth/LoginPage';
import EventsPage from './features/events/EventsPage';
import CreateEventPage from './features/events/CreateEventPage';
import EditEventPage from './features/events/EditEventPage';
import MyRegistrationsPage from './features/events/MyRegistrationsPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/create" element={<CreateEventPage />} />
        <Route path="/events/edit/:id" element={<EditEventPage />} />
        <Route path="/my-registrations" element={<MyRegistrationsPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
