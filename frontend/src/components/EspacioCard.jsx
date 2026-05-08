import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DisponibilidadCalendario from './DisponibilidadCalendario';

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

  // Mock amenities para la UI visual si no vienen del backend
  const amenidades = espacio.recursos || ['Aire acondicionado', 'Proyector'];

  return (
    <>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#fff3eb', borderRadius: '8px' }}>
                {espacio.tipo_nombre?.toLowerCase().includes('laboratorio') ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#1f2937' }}>{espacio.nombre}</h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>{espacio.tipo_nombre}</p>
              </div>
            </div>
            <span style={getBadgeStyle(espacio.estado)}>{espacio.estado?.replace('_', ' ')}</span>
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', margin: '1rem 0', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              {espacio.capacidad} personas
            </p>
            <p style={{ fontSize: '0.9rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {espacio.ubicacion}
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {amenidades.map((amenidad, idx) => (
                <span key={idx} style={{ backgroundColor: '#f3f4f6', color: '#6b7280', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {typeof amenidad === 'string' ? amenidad : amenidad.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: usuario?.rol === 'admin' ? '0.5rem' : '0' }}>
            <button 
              onClick={() => setShowCalendario(true)}
              style={{ flex: 1, padding: '0.6rem', backgroundColor: 'transparent', border: '1px solid #ea580c', color: '#ea580c', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              Ver disponibilidad
            </button>
            <button 
              onClick={() => onReservar && onReservar(espacio)}
              style={{ flex: 1, padding: '0.6rem', backgroundColor: '#ea580c', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              Reservar
            </button>
          </div>
          {usuario?.rol === 'admin' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ flex: 1, padding: '0.4rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', color: '#374151', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
              <button style={{ flex: 1, padding: '0.4rem', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
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
    </>
  );
};

export default EspacioCard;
