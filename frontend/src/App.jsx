import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Espacios from './pages/Espacios';
import Reservaciones from './pages/Reservaciones';
import NuevaReservacion from './pages/NuevaReservacion';
import Notificaciones from './pages/Notificaciones';
import GestionEspacios from './pages/GestionEspacios';

const ProtectedRoute = ({ children }) => {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { usuario } = useAuth();

  return (
    <Router>
      {usuario ? (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fb' }}>
          {/* Sidebar fijo izquierda */}
          <Sidebar />

          {/* Todo lo de la derecha: topbar + contenido */}
          <div style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Layout>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/espacios" element={<ProtectedRoute><Espacios /></ProtectedRoute>} />
                <Route path="/reservaciones" element={<ProtectedRoute><Reservaciones /></ProtectedRoute>} />
                <Route path="/reservaciones/nueva" element={<ProtectedRoute><NuevaReservacion /></ProtectedRoute>} />
                <Route path="/notificaciones" element={<ProtectedRoute><Notificaciones /></ProtectedRoute>} />
                <Route path="/gestion" element={<ProtectedRoute><GestionEspacios /></ProtectedRoute>} />
                <Route path="/login" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;