import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const Layout = ({ children }) => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => {
    const fetchNoLeidas = () => {
      api.get('/notificaciones/no-leidas')
        .then(res => setNoLeidas(res.data.total ?? res.data.count ?? 0))
        .catch(() => setNoLeidas(0));
    };
    fetchNoLeidas();
    window.addEventListener('notificaciones-actualizadas', fetchNoLeidas);
    return () => window.removeEventListener('notificaciones-actualizadas', fetchNoLeidas);
  }, []);

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Topbar */}
      <div style={{
        height: '64px', background: 'white', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* Título con barra roja */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '4px', height: '32px', background: '#c0392b', borderRadius: '2px' }} />
          <div>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '17px', color: '#111827' }}>Sistema de Reservaciones</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Instituto Tecnológico de Oaxaca</p>
          </div>
        </div>

        {/* Derecha: modo oscuro + campana + usuario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Botón modo oscuro */}
          <button style={{
            width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #e5e7eb',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#6b7280',
          }}>
            <IconMoon />
          </button>

          {/* Campana con badge */}
          <button
            onClick={() => navigate('/notificaciones')}
            style={{
              width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #e5e7eb',
              background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#6b7280', position: 'relative',
            }}>
            <IconBell />
            {noLeidas > 0 && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px',
                background: '#c0392b', color: 'white', borderRadius: '50%',
                width: '18px', height: '18px', fontSize: '11px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{noLeidas}</span>
            )}
          </button>

          {/* Nombre + rol + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#111827' }}>{usuario?.nombre}</p>
              {usuario?.rol === 'admin' && (
                <span style={{
                  fontSize: '11px', color: '#c0392b', fontWeight: '700',
                  background: '#fee2e2', padding: '2px 8px', borderRadius: '4px',
                }}>ADMIN</span>
              )}
            </div>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', background: '#c0392b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '700', fontSize: '15px',
            }}>
              {iniciales}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, background: '#f8f9fb' }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;