import React, { useState } from 'react';
import api from '../api/axios';

const DisponibilidadCalendario = ({ espacio, onClose }) => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState('');

  const handleVerificar = async () => {
    if (!fechaInicio || !fechaFin) {
      setErrorValidacion('Debes ingresar ambas fechas.');
      return;
    }
    
    if (new Date(fechaInicio) >= new Date(fechaFin)) {
      setErrorValidacion('La fecha de inicio debe ser anterior a la fecha de fin.');
      return;
    }

    setErrorValidacion('');
    setCargando(true);
    setResultado(null);

    try {
      const { data } = await api.post('/disponibilidad/verificar', {
        espacioId: espacio.id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      });
      setResultado(data);
    } catch (error) {
      setResultado({
        disponible: false,
        razon: error.response?.data?.error || 'Error al conectar con el servidor'
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>Consultar disponibilidad</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.2rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#fff7ed', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
             <div style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '8px' }}>
                {espacio.tipo_nombre?.toLowerCase().includes('laboratorio') ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                )}
              </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#1f2937' }}>{espacio.nombre}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{espacio.ubicacion}</p>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Fecha y hora inicio</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="datetime-local" 
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Fecha y hora fin</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="datetime-local" 
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} 
              />
            </div>
          </div>

          {errorValidacion && (
            <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{errorValidacion}</p>
          )}

          {resultado && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              backgroundColor: resultado.disponible ? '#dcfce7' : '#fee2e2',
              color: resultado.disponible ? '#166534' : '#991b1b',
              border: `1px solid ${resultado.disponible ? '#bbf7d0' : '#fecaca'}`
            }}>
              <p style={{ margin: 0, fontWeight: '600' }}>
                {resultado.disponible ? '✓ Disponible' : '✗ No disponible'}
              </p>
              {!resultado.disponible && resultado.razon && (
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>{resultado.razon}</p>
              )}
              {!resultado.disponible && resultado.conflictos && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  {resultado.conflictos.reservaciones?.length > 0 && (
                    <p style={{ margin: '0 0 0.2rem 0' }}>Tiene {resultado.conflictos.reservaciones.length} reservación(es) cruzada(s).</p>
                  )}
                  {resultado.conflictos.bloqueados?.length > 0 && (
                    <p style={{ margin: 0 }}>El horario se encuentra bloqueado por administración.</p>
                  )}
                </div>
              )}
            </div>
          )}

          <button 
            onClick={handleVerificar}
            disabled={cargando}
            style={{ 
              width: '100%', 
              padding: '0.8rem', 
              backgroundColor: '#ea580c', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '1rem', 
              fontWeight: '500', 
              cursor: cargando ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: cargando ? 0.7 : 1
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            {cargando ? 'Verificando...' : 'Verificar disponibilidad'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisponibilidadCalendario;
