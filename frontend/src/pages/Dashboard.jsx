import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({ reservaciones: 0, notificaciones: 0 });

  useEffect(() => {
    const cargarStats = async () => {
      const endpointReservaciones = usuario?.rol === 'admin'
        ? '/reservaciones'
        : '/reservaciones/mis-reservaciones';

      let totalReservaciones = 0;
      let noLeidas = 0;

      try {
        const resReservaciones = await api.get(endpointReservaciones);
        totalReservaciones = resReservaciones.data.length;
      } catch {}

      try {
        const resNotifs = await api.get('/notificaciones');
        noLeidas = resNotifs.data.filter((n) => !n.leida).length;
      } catch {}

      setStats({ reservaciones: totalReservaciones, notificaciones: noLeidas });
    };
    cargarStats();
  }, [usuario]);

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Bienvenido, {usuario?.nombre}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: '#1976d2' }}>{stats.reservaciones}</h3>
          <p>Mis Reservaciones</p>
          <Link to="/reservaciones"><button className="btn btn-primary" style={{ marginTop: '1rem' }}>Ver todas</button></Link>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: '#d32f2f' }}>{stats.notificaciones}</h3>
          <p>Notificaciones sin leer</p>
          <Link to="/notificaciones"><button className="btn btn-primary" style={{ marginTop: '1rem' }}>Ver todas</button></Link>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem' }}>Hacer una nueva reservación</p>
          <Link to="/reservaciones/nueva"><button className="btn btn-primary">Nueva Reservación</button></Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
