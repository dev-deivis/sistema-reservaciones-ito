import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useWindowSize from '../hooks/useWindowSize';

// ── Íconos ──────────────────────────────────────────────
const IconCal = ({ color = '#c0392b' }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconCheck = ({ color = '#16a34a' }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    <polyline points="9 15 11 17 15 13"/>
  </svg>
);
const IconBell = ({ color = '#d97706' }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconBuilding = ({ color = '#7c3aed' }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
  </svg>
);
const IconGear = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconShield = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconMonitor = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const IconUsers = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconCheckCircleSmall = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconClockSmall = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconXCircleSmall = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconBellSmall = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconEditSmall = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ── Badge estado ─────────────────────────────────────────
const badges = {
  pendiente:  { bg: '#fef3c7', color: '#b45309', label: 'Pendiente' },
  confirmada: { bg: '#dcfce7', color: '#166534', label: 'Confirmada' },
  cancelada:  { bg: '#fee2e2', color: '#991b1b', label: 'Cancelada' },
  completada: { bg: '#dbeafe', color: '#1e40af', label: 'Completada' },
};

const fechaCorta = (iso) => new Date(iso).toLocaleDateString('es-MX', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

const hoy = () => new Date().toLocaleDateString('es-MX', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}).replace(/^\w/, c => c.toUpperCase());

const calcularTendencia = (reservaciones) => {
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
  const anioAnterior = mesActual === 0 ? anioActual - 1 : anioActual;

  const deEsteMes = reservaciones.filter(r => {
    const d = new Date(r.created_at);
    return d.getMonth() === mesActual && d.getFullYear() === anioActual;
  }).length;

  const delMesAnterior = reservaciones.filter(r => {
    const d = new Date(r.created_at);
    return d.getMonth() === mesAnterior && d.getFullYear() === anioAnterior;
  }).length;

  if (delMesAnterior === 0) return null;
  const cambio = ((deEsteMes - delMesAnterior) / delMesAnterior) * 100;
  return { valor: Math.abs(Math.round(cambio)), positiva: cambio >= 0 };
};

// ── Componente principal ──────────────────────────────────
const Dashboard = () => {
  const { usuario } = useAuth();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const [stats, setStats] = useState({
    total: 0, activas: 0, notificaciones: 0,
    espaciosDisponibles: 0, espaciosTotal: 0,
    tendenciaTotal: null,
  });
  const [proximas, setProximas] = useState([]);
  const [actividad, setActividad] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const endpointReservaciones = usuario?.rol === 'admin'
        ? '/reservaciones'
        : '/reservaciones/mis-reservaciones';

      let reservaciones = [];
      let notificaciones = [];
      let espacios = [];

      try {
        const resR = await api.get(endpointReservaciones);
        reservaciones = resR.data;
      } catch {}

      try {
        const resN = await api.get('/notificaciones');
        notificaciones = resN.data;
      } catch {}

      try {
        const resE = await api.get('/espacios');
        espacios = resE.data;
      } catch {}

      const activas = reservaciones.filter(r => r.estado === 'pendiente' || r.estado === 'confirmada').length;
      const noLeidas = notificaciones.filter(n => !n.leida).length;
      const espaciosDisponibles = espacios.filter(e => e.estado === 'disponible').length;

      setStats({
        total: reservaciones.length,
        activas,
        notificaciones: noLeidas,
        espaciosDisponibles,
        espaciosTotal: espacios.length,
        tendenciaTotal: calcularTendencia(reservaciones),
      });

      const prox = reservaciones
        .filter(r => r.estado === 'pendiente' || r.estado === 'confirmada')
        .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
        .slice(0, 3);
      setProximas(prox);
      setActividad(notificaciones.slice(0, 3));
    };

    cargar();
  }, [usuario]);

  const nombre = usuario?.nombre?.split(' ')[0] || 'Usuario';

  const statsGrid = isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)';
  const bottomGrid = isMobile ? '1fr' : '1fr 1fr';
  const padding = isMobile ? '16px' : '24px 32px';

  return (
    <div style={{ padding, width: '100%', boxSizing: 'border-box' }}>

      {/* ── Banner bienvenida ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1f0b3e 0%, #150529 100%)',
        borderRadius: '16px',
        padding: isMobile ? '20px' : '32px 36px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: '700', color: 'white', margin: 0, fontFamily: '"Outfit", "Inter", sans-serif' }}>
              Bienvenido, {nombre}
            </h1>
            {usuario?.rol === 'admin' && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(220, 38, 38, 0.1)', color: '#ef4444',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: '600'
              }}>
                <IconShield /> Admin
              </span>
            )}
          </div>
          <p style={{ color: '#94a3b8', fontSize: isMobile ? '12px' : '14px', margin: 0 }}>{hoy()}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {usuario?.rol === 'admin' && !isMobile && (
            <Link to="/espacios" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '9px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)', color: 'white',
                fontWeight: '600', fontSize: '14px', cursor: 'pointer',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                <IconGear /> Gestionar Espacios
              </button>
            </Link>
          )}
          <Link to="/reservaciones/nueva" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: isMobile ? '9px 14px' : '10px 20px', borderRadius: '9px',
              border: 'none', background: '#dc2626',
              color: 'white', fontWeight: '600', fontSize: isMobile ? '13px' : '14px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#b91c1c'}
            onMouseOut={e => e.currentTarget.style.background = '#dc2626'}>
              <IconCal color="white" /> {isMobile ? 'Reservar' : 'Nueva Reservación'}
            </button>
          </Link>
        </div>
      </div>

      {/* ── Tarjetas estadísticas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: statsGrid, gap: isMobile ? '12px' : '20px', marginBottom: '20px' }}>
        {[
          { icon: <IconCal />, bg: '#fee2e2', num: stats.total, label: 'Total de reservaciones', tendencia: stats.tendenciaTotal },
          { icon: <IconCheck />, bg: '#dcfce7', num: stats.activas, label: 'Reservaciones activas', tendencia: null },
          { icon: <IconBell />, bg: '#fef3c7', num: stats.notificaciones, label: 'Notificaciones sin leer', tendencia: null },
          { icon: <IconBuilding />, bg: '#ede9fe', num: `${stats.espaciosDisponibles} de ${stats.espaciosTotal}`, label: 'Espacios disponibles', tendencia: null },
        ].map(({ icon, bg, num, label, tendencia }, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
            padding: isMobile ? '16px' : '24px', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            {tendencia && (
              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: tendencia.positiva ? '#16a34a' : '#dc2626' }}>
                  {tendencia.positiva ? '↑' : '↓'} {tendencia.valor}%
                </span>
              </div>
            )}
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px', background: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
            }}>
              {icon}
            </div>
            <p style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0', fontFamily: '"Inter", sans-serif' }}>{num}</p>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, fontWeight: '500' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Fila inferior: Próximas + Actividad ── */}
      <div style={{ display: 'grid', gridTemplateColumns: bottomGrid, gap: isMobile ? '12px' : '24px' }}>

        {/* Próximas reservaciones */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: isMobile ? '16px' : '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', background: '#fee2e2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCal />
              </div>
              <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>Próximas reservaciones</span>
            </div>
            <Link to="/reservaciones" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#b91c1c', fontSize: '13px', fontWeight: '600' }}>
              Ver todas <IconArrow />
            </Link>
          </div>

          {proximas.length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: '14px', padding: '8px 0' }}>No hay reservaciones próximas.</p>
          )}

          {proximas.map((r, i) => {
            const badge = badges[r.estado] || badges.pendiente;
            const esJunta = r.espacio_nombre.toLowerCase().includes('junta');
            return (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 0', flexWrap: 'wrap', gap: '8px',
                borderBottom: i < proximas.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {esJunta ? <IconUsers color="#dc2626" /> : <IconMonitor color="#dc2626" />}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#111827' }}>{r.espacio_nombre}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>{fechaCorta(r.fecha_inicio).toLowerCase()}</p>
                  </div>
                </div>
                <span style={{
                  background: badge.bg, color: badge.color, border: `1px solid ${badge.color}33`,
                  borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '600'
                }}>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actividad reciente */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: isMobile ? '16px' : '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', background: '#ede9fe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconBell color="#7c3aed" />
              </div>
              <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>Actividad reciente</span>
            </div>
            <Link to="/notificaciones" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#b91c1c', fontSize: '13px', fontWeight: '600' }}>
              Ver todas <IconArrow />
            </Link>
          </div>

          {actividad.length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: '14px', padding: '8px 0' }}>Sin actividad reciente.</p>
          )}

          {actividad.map((n, i) => {
            let IconoNotificacion = <IconBellSmall />;
            let bgIcono = '#fef3c7';
            if (n.tipo === 'modificacion' || n.mensaje.toLowerCase().includes('modific')) {
              IconoNotificacion = <IconEditSmall />; bgIcono = '#ede9fe';
            } else if (n.mensaje.toLowerCase().includes('confirmada')) {
              IconoNotificacion = <IconCheckCircleSmall />; bgIcono = '#f0fdf4';
            } else if (n.mensaje.toLowerCase().includes('cancelada')) {
              IconoNotificacion = <IconXCircleSmall />; bgIcono = '#fef2f2';
            } else if (n.mensaje.toLowerCase().includes('recordatorio') || n.mensaje.toLowerCase().includes('mañana')) {
              IconoNotificacion = <IconClockSmall />; bgIcono = '#eff6ff';
            }

            return (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 0', position: 'relative',
                borderBottom: i < actividad.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}>
                {!n.leida && (
                  <div style={{ position: 'absolute', left: '-16px', top: 0, bottom: 0, width: '4px', background: '#dc2626' }} />
                )}
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: bgIcono, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {IconoNotificacion}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#374151', lineHeight: 1.4, fontWeight: '500' }}>
                    {n.mensaje}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                    {fechaCorta(n.created_at).toLowerCase()}
                  </p>
                </div>
                {!n.leida && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
