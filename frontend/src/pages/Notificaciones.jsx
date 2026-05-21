import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import useWindowSize from '../hooks/useWindowSize';

const Notificaciones = () => {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    api.get('/notificaciones')
      .then(({ data }) => setNotificaciones(data))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const [errorAccion, setErrorAccion] = useState('');

  const marcarLeida = async (id) => {
    try {
      await api.patch(`/notificaciones/${id}/leer`);
      cargar();
    } catch {
      setErrorAccion('No se pudo marcar la notificación como leída');
      setTimeout(() => setErrorAccion(''), 3000);
    }
  };

  const marcarTodas = async () => {
    try {
      await api.patch('/notificaciones/leer-todas');
      cargar();
      window.dispatchEvent(new CustomEvent('notificaciones-actualizadas'));
    } catch {
      setErrorAccion('No se pudieron marcar las notificaciones como leídas');
      setTimeout(() => setErrorAccion(''), 3000);
    }
  };

  if (cargando) return <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</p>;

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '16px' : '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
          Todas las Notificaciones
          {unreadCount > 0 && (
            <span style={{ backgroundColor: '#c62828', color: '#fff', fontSize: '0.85rem', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontWeight: '500' }}>
              {unreadCount} sin leer
            </span>
          )}
        </h2>
        <button 
          onClick={marcarTodas}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'transparent',
            border: '1px solid #c62828',
            color: '#c62828',
            padding: '0.5rem 1.2rem',
            borderRadius: '2rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fff0f0'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Marcar todas como leídas
        </button>
      </div>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1rem' }}>Tus notificaciones recientes</p>

      {errorAccion && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 16px', marginBottom: '1rem', color: '#b91c1c', fontSize: '14px' }}>
          {errorAccion}
        </div>
      )}

      <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
        {notificaciones.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Sin notificaciones.</div>}
        
        {notificaciones.map((n, index) => {
          const msgLower = n.mensaje.toLowerCase();
          let Icon = null;
          let iconColor = '';
          let iconBg = '';
          
          if (msgLower.includes('cancelada')) {
            Icon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />;
            iconColor = '#d32f2f'; // Red
            iconBg = '#ffebee';
          } else if (msgLower.includes('recordatorio')) {
            Icon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
            iconColor = '#1976d2'; // Blue
            iconBg = '#e3f2fd';
          } else {
            // Default to green check
            Icon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />;
            iconColor = '#2e7d32'; // Green
            iconBg = '#e8f5e9';
          }

          const dateStr = new Date(n.created_at).toLocaleString('es-MX', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', hour12: true 
          }).toLowerCase();

          return (
            <div 
              key={n.id}
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                padding: '1.5rem',
                borderBottom: index < notificaciones.length - 1 ? '1px solid #f0f0f0' : 'none',
                backgroundColor: n.leida ? '#fff' : '#fff9f9',
                cursor: n.leida ? 'default' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onClick={() => { if (!n.leida) marcarLeida(n.id) }}
            >
              {/* Icon */}
              <div style={{ 
                width: '42px', height: '42px', borderRadius: '50%', 
                backgroundColor: iconBg, color: iconColor,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                flexShrink: 0, marginRight: '1rem',
                border: `1px solid ${iconColor}33`
              }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {Icon}
                </svg>
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#777', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Sistema</span>
                </div>
                <p style={{ fontWeight: n.leida ? '500' : 'bold', color: n.leida ? '#444' : '#111', fontSize: '0.95rem', marginBottom: '0.4rem', lineHeight: '1.4' }}>
                  {n.mensaje}
                </p>
                {n.espacio_nombre && (
                  <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Espacio: {n.espacio_nombre}</p>
                )}
                <p style={{ color: '#888', fontSize: '0.85rem' }}>
                  {dateStr}
                </p>
              </div>

              {/* Unread indicator */}
              {!n.leida && (
                <div style={{ 
                  width: '10px', height: '10px', borderRadius: '50%', 
                  backgroundColor: '#c62828',
                  flexShrink: 0,
                  marginLeft: '1rem',
                  marginTop: '0.8rem'
                }}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notificaciones;
