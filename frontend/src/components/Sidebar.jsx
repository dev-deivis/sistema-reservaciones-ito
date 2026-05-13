import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconEspacios = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconCalendario = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconGear = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
  </svg>
);
const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const Sidebar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    { to: '/reservaciones/nueva', label: 'Nueva Reservación', icon: <IconCalendario /> },
    { to: '/reservaciones', label: 'Mis Reservaciones', icon: <IconCalendario /> },
    { to: '/notificaciones', label: 'Notificaciones', icon: <IconBell />, badge: true },
    ...(usuario?.rol === 'admin' ? [{ to: '/gestion', label: 'Gestión de Espacios', icon: <IconGear /> }] : []),
  ];

  return (
    <div style={{
      width: '280px', minHeight: '100vh', background: '#1e2139',
      display: 'flex', flexDirection: 'column', position: 'fixed',
      top: 0, left: 0, bottom: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '48px', height: '48px', background: '#c0392b', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <IconCalendario />
        </div>
        <div>
          <p style={{ margin: 0, color: 'white', fontWeight: '700', fontSize: '18px', lineHeight: 1.2 }}>ReservaITO</p>
          <p style={{ margin: 0, color: '#8892b0', fontSize: '12px' }}>Instituto Tecnológico</p>
        </div>
      </div>

      {/* Badge rol */}
      <div style={{ padding: '0 20px 16px' }}>
        <span style={{
          display: 'inline-block', background: '#c0392b', color: 'white',
          borderRadius: '6px', padding: '4px 14px', fontSize: '12px', fontWeight: '600',
        }}>
          {usuario?.rol === 'admin' ? 'Administrador' : 'Usuario'}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        <p style={{
          fontSize: '11px', color: '#4a5578', fontWeight: '700',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          margin: '0 8px 10px',
        }}>Menú Principal</p>

        {navItems.map(({ to, label, icon, badge }) => {
          const active = isActive(to);
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '8px', marginBottom: '4px',
              textDecoration: 'none',
              color: active ? 'white' : '#8892b0',
              background: active ? '#c0392b' : 'transparent',
              fontWeight: active ? '600' : '400',
              fontSize: '15px',
              transition: 'all 0.15s',
            }}>
              {icon}
              <span style={{ flex: 1 }}>{label}</span>
              {badge && !active && (
                <span style={{
                  background: '#c0392b', color: 'white', borderRadius: '10px',
                  padding: '2px 8px', fontSize: '12px', fontWeight: '700',
                }}>3</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Usuario */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', background: '#c0392b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0,
          }}>
            {iniciales}
          </div>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {usuario?.nombre}
          </p>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          width: '100%', padding: '10px 14px', borderRadius: '7px',
          border: 'none', background: 'rgba(255,255,255,0.05)',
          color: '#8892b0', fontSize: '14px', cursor: 'pointer',
        }}>
          <IconLogout /> Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;