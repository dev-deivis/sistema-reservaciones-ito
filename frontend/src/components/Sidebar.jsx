import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ── Íconos ──────────────────────────────────────────────
const IconDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconEspacios = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
    <rect x="9" y="9" width="6" height="11"/>
  </svg>
);
const IconCalendarioPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/>
    <line x1="10" y1="16" x2="14" y2="16"/>
  </svg>
);
const IconCalendarioList = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="8" y1="14" x2="16" y2="14"/>
    <line x1="8" y1="18" x2="12" y2="18"/>
  </svg>
);
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconGear = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
  </svg>
);
const IconLogout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconPersonas = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconCalendarLogo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <circle cx="9" cy="15" r="1" fill="white" /><circle cx="15" cy="15" r="1" fill="white" />
  </svg>
);
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
  }, [location]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => {
    if (path === '/reservaciones') return location.pathname === '/reservaciones';
    return path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  };

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <IconDashboard /> },
    { to: '/espacios', label: 'Espacios', icon: <IconEspacios /> },
    { to: '/reservaciones/nueva', label: 'Nueva Reservación', icon: <IconCalendarioPlus /> },
    { to: '/reservaciones', label: 'Mis Reservaciones', icon: <IconCalendarioList /> },
    { to: '/notificaciones', label: 'Notificaciones', icon: <IconBell />, badge: true },
    ...(usuario?.rol === 'admin' ? [
      { to: '/gestion', label: 'Gestión de Espacios', icon: <IconGear /> },
      { to: '/usuarios', label: 'Usuarios', icon: <IconPersonas /> },
    ] : []),
  ];

  const sidebarWidth = isMobile ? '260px' : '320px';

  return (
    <div style={{
      width: sidebarWidth, minHeight: '100vh', background: '#11032a',
      display: 'flex', flexDirection: 'column', position: 'fixed',
      top: 0, left: 0, bottom: 0, zIndex: 100,
      borderRight: '1px solid rgba(255,255,255,0.05)',
      transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
      transition: 'transform 0.3s ease',
      overflowY: 'auto',
    }}>
      {/* Logo Header */}
      <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', background: '#d92a00', borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(217, 42, 0, 0.4)'
          }}>
            <IconCalendarLogo />
          </div>
          <div>
            <p style={{ margin: 0, color: 'white', fontWeight: '800', fontSize: isMobile ? '18px' : '22px', letterSpacing: '-0.5px', fontFamily: '"Outfit", "Inter", sans-serif' }}>
              ReservaITO
            </p>
            <p style={{ margin: 0, color: '#a29ab8', fontSize: '12px', marginTop: '2px', fontWeight: '500' }}>
              Instituto Tecnológico
            </p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', border: 'none', background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px', cursor: 'pointer', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <IconClose />
          </button>
        )}
      </div>

      {/* Badge Admin */}
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(217, 42, 0, 0.15)', color: '#ef4444',
          border: '1px solid rgba(217, 42, 0, 0.3)',
          borderRadius: '24px', padding: '6px 14px', fontSize: '13px', fontWeight: '600',
        }}>
          <IconShield />
          {usuario?.rol === 'admin' ? 'Administrador' : 'Usuario'}
        </div>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
        <p style={{
          fontSize: '12px', color: '#7c7790', fontWeight: '700',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          margin: '0 8px 16px', fontFamily: '"Inter", sans-serif'
        }}>Menú Principal</p>

        {navItems.map(({ to, label, icon, badge }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={isMobile ? onClose : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '11px 14px', borderRadius: '14px', marginBottom: '6px',
                textDecoration: 'none',
                color: active ? 'white' : '#c3bdd4',
                background: active ? '#d92a00' : 'transparent',
                fontWeight: active ? '600' : '500',
                fontSize: '15px',
                transition: 'all 0.2s ease',
                fontFamily: '"Inter", sans-serif'
              }}
              onMouseOver={e => { if (!active) e.currentTarget.style.color = 'white'; }}
              onMouseOut={e => { if (!active) e.currentTarget.style.color = '#c3bdd4'; }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                color: active ? 'white' : '#9c94b3',
                transition: 'all 0.2s ease',
              }}>
                {icon}
              </div>
              <span style={{ flex: 1 }}>{label}</span>
              {badge && !active && noLeidas > 0 && (
                <span style={{
                  background: '#a91d00', color: 'white', borderRadius: '12px',
                  padding: '2px 8px', fontSize: '12px', fontWeight: '700',
                  minWidth: '24px', textAlign: 'center'
                }}>{noLeidas}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Usuario y Logout */}
      <div style={{ padding: '0 20px 28px' }}>
        {/* User Card → Mi perfil */}
        <Link to="/perfil" onClick={isMobile ? onClose : undefined} style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#1d0f3c', borderRadius: '18px', padding: '14px',
            display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px',
            cursor: 'pointer', transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#2a1a50'}
          onMouseOut={e => e.currentTarget.style.background = '#1d0f3c'}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', background: '#d92a00',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '800', fontSize: '15px', flexShrink: 0,
              boxShadow: '0 4px 10px rgba(217, 42, 0, 0.3)'
            }}>
              {iniciales}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{
                margin: 0, color: 'white', fontSize: '14px', fontWeight: '600',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontFamily: '"Inter", sans-serif'
              }}>
                {usuario?.nombre || 'Usuario'}
              </p>
              <p style={{ margin: 0, color: '#a29ab8', fontSize: '12px', marginTop: '2px' }}>
                Mi perfil
              </p>
            </div>
          </div>
        </Link>

        {/* Logout Button */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          width: '100%', padding: '12px 14px', borderRadius: '14px',
          border: 'none', background: 'transparent',
          color: '#c3bdd4', fontSize: '15px', fontWeight: '500', cursor: 'pointer',
          transition: 'all 0.2s ease', fontFamily: '"Inter", sans-serif'
        }}
        onMouseOver={e => {
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.color = '#c3bdd4';
          e.currentTarget.style.background = 'transparent';
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            color: '#c3bdd4'
          }}>
            <IconLogout />
          </div>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
