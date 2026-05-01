import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <div>
        <strong>ITO Reservaciones</strong>
      </div>
      <div>
        <Link to="/">Inicio</Link>
        <Link to="/espacios">Espacios</Link>
        <Link to="/reservaciones">Mis Reservaciones</Link>
        <Link to="/notificaciones">Notificaciones</Link>
      </div>
      <div>
        <span style={{ marginRight: '1rem' }}>{usuario?.nombre}</span>
        <button className="btn btn-secondary" onClick={handleLogout}>Salir</button>
      </div>
    </nav>
  );
};

export default Navbar;
