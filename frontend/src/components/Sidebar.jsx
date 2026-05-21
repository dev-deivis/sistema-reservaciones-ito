import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

const Sidebar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/notificaciones/no-leidas', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setNoLeidas(data.count ?? data ?? 0))
      .catch(() => setNoLeidas(0));
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

  return (
    <div style={{
      width: '320px', minHeight: '100vh', background: '#11032a',
      display: 'flex', flexDirection: 'column', position: 'fixed',
      top: 0, left: 0, bottom: 0, zIndex: 100,
      borderRight: '1px solid rgba(255,255,255,0.05)'
    }}>
      {/* Logo Header */}
      <div style={{ padding: '32px 24px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '56px', height: '56px', background: '#d92a00', borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(217, 42, 0, 0.4)'
        }}>
          <IconCalendarLogo />
        </div>
        <div>
          <p style={{ margin: 0, color: 'white', fontWeight: '800', fontSize: '22px', letterSpacing: '-0.5px', fontFamily: '"Outfit", "Inter", sans-serif' }}>
            ReservaITO
          </p>
          <p style={{ margin: 0, color: '#a29ab8', fontSize: '13px', marginTop: '2px', fontWeight: '500' }}>
            Instituto Tecnológico
          </p>
        </div>
      </div>

      {/* Badge Admin */}
      <div style={{ padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(217, 42, 0, 0.15)', color: '#ef4444',
          border: '1px solid rgba(217, 42, 0, 0.3)',
          borderRadius: '24px', padding: '6px 16px', fontSize: '14px', fontWeight: '600',
        }}>
          <IconShield /> 
          {usuario?.rol === 'admin' ? 'Administrador' : 'Usuario'}
        </div>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
        <p style={{
          fontSize: '12px', color: '#7c7790', fontWeight: '700',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          margin: '0 8px 16px', fontFamily: '"Inter", sans-serif'
        }}>Menú Principal</p>

        {navItems.map(({ to, label, icon, badge }) => {
          const active = isActive(to);
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px 16px', borderRadius: '16px', marginBottom: '8px',
              textDecoration: 'none',
              color: active ? 'white' : '#c3bdd4',
              background: active ? '#d92a00' : 'transparent',
              fontWeight: active ? '600' : '500',
              fontSize: '16px',
              transition: 'all 0.2s ease',
              fontFamily: '"Inter", sans-serif'
            }}
            onMouseOver={e => { if (!active) e.currentTarget.style.color = 'white'; }}
            onMouseOut={e => { if (!active) e.currentTarget.style.color = '#c3bdd4'; }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
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
      <div style={{ padding: '0 24px 32px' }}>
        
        {/* User Card */}
        <div style={{ 
          background: '#1d0f3c', borderRadius: '20px', padding: '16px',
          display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', background: '#d92a00',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '16px', flexShrink: 0,
            boxShadow: '0 4px 10px rgba(217, 42, 0, 0.3)'
          }}>
            {iniciales}
          </div>
          <p style={{ 
            margin: 0, color: 'white', fontSize: '15px', fontWeight: '600', 
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontFamily: '"Inter", sans-serif'
          }}>
            {usuario?.nombre || 'Maria Lopez Hernand...'}
          </p>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          width: '100%', padding: '14px 16px', borderRadius: '16px',
          border: 'none', background: 'transparent',
          color: '#c3bdd4', fontSize: '16px', fontWeight: '500', cursor: 'pointer',
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
            width: '40px', height: '40px', borderRadius: '12px',
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