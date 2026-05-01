import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Espacios from './pages/Espacios';
import Reservaciones from './pages/Reservaciones';
import NuevaReservacion from './pages/NuevaReservacion';
import Notificaciones from './pages/Notificaciones';

const ProtectedRoute = ({ children }) => {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { usuario } = useAuth();

  return (
    <Router>
      {usuario && <Navbar />}
      <div className="container" style={{ marginTop: '1.5rem' }}>
        <Routes>
          <Route path="/login" element={usuario ? <Navigate to="/" /> : <Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/espacios" element={<ProtectedRoute><Espacios /></ProtectedRoute>} />
          <Route path="/reservaciones" element={<ProtectedRoute><Reservaciones /></ProtectedRoute>} />
          <Route path="/reservaciones/nueva" element={<ProtectedRoute><NuevaReservacion /></ProtectedRoute>} />
          <Route path="/notificaciones" element={<ProtectedRoute><Notificaciones /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
