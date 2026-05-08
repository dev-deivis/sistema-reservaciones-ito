import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
const IconTrend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconCalSmall = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconPersonSmall = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconBellSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconClockSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

// ── Badge estado ─────────────────────────────────────────
const badges = {
  pendiente:  { bg: '#fef9c3', color: '#854d0e', label: 'Pendiente' },
  confirmada: { bg: '#dcfce7', color: '#166534', label: 'Confirmada' },
  cancelada:  { bg: '#f1f5f9', color: '#475569', label: 'Cancelada' },
  completada: { bg: '#dbeafe', color: '#1e40af', label: 'Completada' },
};

// ── Helpers ───────────────────────────────────────────────
const fechaCorta = (iso) => new Date(iso).toLocaleDateString('es-MX', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

const hoy = () => new Date().toLocaleDateString('es-MX', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}).replace(/^\w/, c => c.toUpperCase());

// ── Componente principal ──────────────────────────────────
const Dashboard = () => {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({
    total: 0, activas: 0, notificaciones: 0, espacios: 0,
  });
  const [proximas, setProximas] = useState([]);
  const [actividad, setActividad] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resR, resN, resE] = await Promise.all([
          api.get('/reservaciones'),
          api.get('/notificaciones'),
          api.get('/espacios'),
        ]);
        const reservaciones = resR.data;
        const noLeidas = resN.data.filter(n => !n.leida).length;
        const activas = reservaciones.filter(r => r.estado === 'pendiente' || r.estado === 'confirmada').length;

        setStats({
          total: reservaciones.length,
          activas,
          notificaciones: noLeidas,
          espacios: resE.data.length,
        });

        // Próximas: activas ordenadas por fecha
        const prox = reservaciones
          .filter(r => r.estado === 'pendiente' || r.estado === 'confirmada')
          .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
          .slice(0, 3);
        setProximas(prox);

        // Actividad reciente: notificaciones
        setActividad(resN.data.slice(0, 3));
      } catch {}
    };
    cargar();
  }, []);

  const nombre = usuario?.nombre?.split(' ')[0] || 'Usuario';

  return (
    <div style={{ padding: '0', width: '100%' }}>

      {/* ── Banner bienvenida ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e2139 0%, #2d3561 100%)',
        padding: '32px 36px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
              Bienvenido, {nombre}
            </h1>
            {usuario?.rol === 'admin' && (
              <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: '600' }}>
                Admin
              </span>
            )}
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>{hoy()}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {usuario?.rol === 'admin' && (
            <Link to="/espacios" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '9px',
                border: '1.5px solid rgba(255,255,255,0.25)',
                background: 'transparent', color: 'white',
                fontWeight: '600', fontSize: '14px', cursor: 'pointer',
              }}>
                <IconGear /> Gestionar Espacios
              </button>
            </Link>
          )}
          <Link to="/reservaciones/nueva" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '9px',
              border: 'none', background: '#c0392b',
              color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
            }}>
              <IconCal color="white" /> Nueva Reservacion
            </button>
          </Link>
        </div>
      </div>

      <div style={{ padding: '28px 36px' }}>

        {/* ── Tarjetas estadísticas ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { icon: <IconCal />, bg: '#fee2e2', num: stats.total, label: 'Total de reservaciones', trend: '+12%' },
            { icon: <IconCheck />, bg: '#dcfce7', num: stats.activas, label: 'Reservaciones activas', trend: '+5%' },
            { icon: <IconBell />, bg: '#fef3c7', num: stats.notificaciones, label: 'Notificaciones sin leer', trend: null },
            { icon: <IconBuilding />, bg: '#ede9fe', num: stats.espacios, label: 'Espacios disponibles', trend: '+2' },
          ].map(({ icon, bg, num, label, trend }, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
              padding: '20px 22px', position: 'relative',
            }}>
              {trend && (
                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconTrend />
                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>{trend}</span>
                </div>
              )}
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px', background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
              }}>
                {icon}
              </div>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>{num}</p>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Fila inferior: Próximas + Actividad ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Próximas reservaciones */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', background: '#fee2e2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconCal />
                </div>
                <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>Proximas reservaciones</span>
              </div>
              <Link to="/reservaciones" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#c0392b', fontSize: '13px', fontWeight: '600' }}>
                Ver todas <IconArrow />
              </Link>
            </div>

            {proximas.length === 0 && (
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>No hay reservaciones próximas.</p>
            )}

            {proximas.map((r, i) => {
              const badge = badges[r.estado] || badges.pendiente;
              const isPersona = r.estado === 'confirmada';
              return (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i < proximas.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isPersona ? <IconPersonSmall color="#c0392b" /> : <IconCalSmall color="#c0392b" />}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#111827' }}>{r.espacio_nombre}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{fechaCorta(r.fecha_inicio)}</p>
                    </div>
                  </div>
                  <span style={{ background: badge.bg, color: badge.color, borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '600' }}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Actividad reciente */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', background: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconBell />
                </div>
                <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>Actividad reciente</span>
              </div>
              <Link to="/notificaciones" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#c0392b', fontSize: '13px', fontWeight: '600' }}>
                Ver todas <IconArrow />
              </Link>
            </div>

            {actividad.length === 0 && (
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>Sin actividad reciente.</p>
            )}

            {actividad.map((n, i) => (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '12px 0',
                borderBottom: i < actividad.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: n.leida ? '#f0fdf4' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {n.leida ? <IconBellSmall /> : <IconClockSmall />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>{n.mensaje}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                    {new Date(n.creado_en || n.created_at).toLocaleString('es-MX')}
                  </p>
                </div>
                {!n.leida && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c0392b', flexShrink: 0, marginTop: '4px' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;