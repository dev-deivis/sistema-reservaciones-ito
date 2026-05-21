import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DisponibilidadCalendario from './DisponibilidadCalendario';
import api from '../api/axios';

const getBadgeStyle = (estado) => {
  const baseStyle = {
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize'
  };
  switch(estado?.toLowerCase()) {
    case 'disponible':
      return { ...baseStyle, backgroundColor: '#d1e7dd', color: '#0a3622' };
    case 'en mantenimiento':
    case 'mantenimiento':
    case 'en_mantenimiento':
      return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
    case 'inactivo':
      return { ...baseStyle, backgroundColor: '#f8d7da', color: '#58151c' };
    default:
      return { ...baseStyle, backgroundColor: '#e2e3e5', color: '#383d41' };
  }
};

const EspacioCard = ({ espacio, onReservar }) => {
  const { usuario } = useAuth();
  const [showCalendario, setShowCalendario] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [toast, setToast] = useState(null);

  const mostrarToast = (tipo, mensaje) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 3500);
  };

  // Mock amenities para la UI visual si no vienen del backend
  const amenidades = espacio.recursos || ['Aire acondicionado', 'Proyector'];

  const handleEliminar = async () => {
    try {
      await api.delete(`/espacios/${espacio.id}`);
      window.location.reload();
    } catch (err) {
      setConfirmando(false);
      mostrarToast('error', err.response?.data?.error || 'Error al eliminar el espacio');
    }
  };

  const handleEditar = () => {
    window.location.href = `/gestion?editar=${espacio.id}`;
  };

  return (
    <>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ padding: '0.6rem', backgroundColor: '#fff3eb', borderRadius: '8px' }}>
                {espacio.tipo_nombre?.toLowerCase().includes('laboratorio') ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#1f2937' }}>{espacio.nombre}</h3>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0.2rem 0 0 0' }}>{espacio.tipo_nombre}</p>
              </div>
            </div>
            <span style={getBadgeStyle(espacio.estado)}>{espacio.estado?.replace('_', ' ')}</span>
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', margin: '1rem 0', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.95rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              {espacio.capacidad} personas
            </p>
            <p style={{ fontSize: '0.95rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {espacio.ubicacion}
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {amenidades.map((amenidad, idx) => (
                <span key={idx} style={{ backgroundColor: '#f3f4f6', color: '#6b7280', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                  {typeof amenidad === 'string' ? amenidad : amenidad.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.2rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: usuario?.rol === 'admin' ? '0.6rem' : '0' }}>
            <button 
              onClick={() => setShowCalendario(true)}
              style={{ flex: 1, padding: '0.8rem', backgroundColor: 'transparent', border: '1px solid #c0392b', color: '#c0392b', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}>
              Ver disponibilidad
            </button>
            <button 
              onClick={() => onReservar && onReservar(espacio)}
              style={{ flex: 1, padding: '0.8rem', backgroundColor: '#c0392b', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}>
              Reservar
            </button>
          </div>
          {usuario?.rol === 'admin' && (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={handleEditar} style={{ flex: 1, padding: '0.6rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', color: '#374151', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Editar</button>
              <button onClick={() => setConfirmando(true)} style={{ flex: 1, padding: '0.6rem', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Eliminar</button>
            </div>
          )}
        </div>
      </div>

      {showCalendario && (
        <DisponibilidadCalendario
          espacio={espacio}
          onClose={() => setShowCalendario(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: toast.tipo === 'exito' ? '#16a34a' : '#d92a00',
          color: 'white', borderRadius: '12px', padding: '13px 22px',
          fontSize: '14px', fontWeight: '600',
          boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
          zIndex: 3000, display: 'flex', alignItems: 'center', gap: '10px',
          whiteSpace: 'nowrap', fontFamily: '"Inter", sans-serif',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {toast.mensaje}
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmando && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(17, 3, 42, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmando(false); }}
        >
          <div style={{
            background: 'white', borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '420px',
            boxShadow: '0 16px 48px rgba(17,3,42,0.22)',
            fontFamily: '"Inter", sans-serif',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#11032a', margin: '0 0 12px' }}>
              Eliminar espacio
            </h2>
            <p style={{ color: '#4b3f6b', fontSize: '14px', margin: '0 0 28px', lineHeight: '1.6' }}>
              ¿Eliminar <strong>"{espacio.nombre}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmando(false)}
                style={{
                  padding: '10px 20px', border: '1px solid #e0dce8', borderRadius: '10px',
                  background: 'white', color: '#6b5f82', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                style={{
                  background: '#d92a00', color: 'white', border: 'none',
                  borderRadius: '10px', padding: '10px 20px',
                  fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EspacioCard;
