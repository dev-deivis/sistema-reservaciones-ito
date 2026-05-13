import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GestionEspacios = () => {
  const { usuario } = useAuth();
  const [espacios, setEspacios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/espacios')
      .then(({ data }) => setEspacios(data))
      .finally(() => setCargando(false));
  }, []);

  const handleReservar = (espacio) => {
    window.location.href = `/reservaciones/nueva?espacio=${espacio.id}`;
  };

  const handleEditar = (espacio) => {
    // Placeholder for edit action
    console.log('Editar espacio:', espacio);
  };

  const handleEliminar = (espacio) => {
    // Placeholder for delete action
    console.log('Eliminar espacio:', espacio);
  };

  if (cargando) return <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando espacios...</p>;

  // Solo el admin debería ver esta vista realmente, pero mostramos igual basado en el diseño
  if (usuario?.rol !== 'admin') {
    return <p style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Acceso denegado. Se requiere rol de administrador.</p>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937' }}>Gestion de Espacios</h2>
          <p style={{ color: '#6b7280', margin: '0.2rem 0 0 0', fontSize: '0.95rem' }}>Administra los espacios del Instituto</p>
        </div>
        
        <button style={{ 
          backgroundColor: '#c62828', 
          color: 'white', 
          border: 'none', 
          padding: '0.6rem 1.2rem', 
          borderRadius: '8px', 
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'opacity 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Agregar nuevo espacio
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafa', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Nombre</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Tipo</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Capacidad</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Ubicacion</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Estado</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {espacios.map((e, idx) => {
              // Determine badge styles based on state
              let badgeBg = '#d1e7dd';
              let badgeColor = '#0a3622';
              const estadoStr = e.estado?.toLowerCase() || 'disponible';
              
              if (estadoStr.includes('mantenimiento')) {
                badgeBg = '#fff3cd';
                badgeColor = '#856404';
              } else if (estadoStr.includes('inactivo') || estadoStr.includes('no disponible')) {
                badgeBg = '#f8d7da';
                badgeColor = '#58151c';
              } else {
                badgeBg = '#e8f5e9';
                badgeColor = '#2e7d32';
              }

              return (
                <tr key={e.id} style={{ borderBottom: idx < espacios.length - 1 ? '1px solid #f0f0f0' : 'none', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '500', color: '#1f2937', fontSize: '0.95rem' }}>{e.nombre}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.95rem' }}>{e.tipo_nombre || e.tipo || 'General'}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.95rem' }}>{e.capacidad} personas</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.95rem' }}>{e.ubicacion}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      backgroundColor: badgeBg, 
                      color: badgeColor, 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.8rem', 
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {e.estado || 'Disponible'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                      <button 
                        onClick={() => handleReservar(e)}
                        title="Reservar/Horarios"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </button>
                      <button 
                        onClick={() => handleEditar(e)}
                        title="Editar espacio"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', padding: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleEliminar(e)}
                        title="Eliminar espacio"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', padding: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {espacios.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white' }}>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>No hay espacios registrados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionEspacios;
