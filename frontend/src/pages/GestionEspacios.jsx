import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GestionEspacios = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [espacios, setEspacios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [espacioDestacadoId, setEspacioDestacadoId] = useState(null);
  const filaDestacadaRef = useRef(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [nuevoEspacio, setNuevoEspacio] = useState({ nombre: '', capacidad: '', ubicacion: '', tipo_espacio_id: '' });
  const [tipos, setTipos] = useState([]);

  const [modalEditar, setModalEditar] = useState(false);
  const [espacioEditando, setEspacioEditando] = useState(null);

  const [confirmandoEliminar, setConfirmandoEliminar] = useState(null);
  const [toast, setToast] = useState(null);

  const mostrarToast = (tipo, mensaje) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    Promise.all([
      api.get('/espacios'),
      api.get('/espacios/tipos'),
    ]).then(([resE, resT]) => {
      setEspacios(resE.data);
      setTipos(resT.data);

      const editarId = parseInt(searchParams.get('editar'));
      if (editarId) {
        const espacio = resE.data.find(e => e.id === editarId);
        if (espacio) {
          setEspacioDestacadoId(editarId);
          setEspacioEditando({ ...espacio, tipo_espacio_id: espacio.tipo_espacio_id || '' });
          setModalEditar(true);
        }
      }
    }).finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (espacioDestacadoId && filaDestacadaRef.current) {
      filaDestacadaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [espacioDestacadoId]);

  const handleReservar = (espacio) => {
    navigate(`/reservaciones/nueva?espacio=${espacio.id}`);
  };

  const handleEliminar = (espacio) => {
    setConfirmandoEliminar(espacio);
  };

  const confirmarEliminar = async () => {
    const espacio = confirmandoEliminar;
    setConfirmandoEliminar(null);
    try {
      await api.delete(`/espacios/${espacio.id}`);
      setEspacios(prev => prev.filter(e => e.id !== espacio.id));
      mostrarToast('exito', 'Espacio eliminado correctamente');
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al eliminar el espacio');
    }
  };

  const handleCrear = async () => {
    try {
      const { data } = await api.post('/espacios', {
        ...nuevoEspacio,
        capacidad: Number(nuevoEspacio.capacidad),
      });
      setEspacios(prev => [...prev, data]);
      setModalCrear(false);
      setNuevoEspacio({ nombre: '', capacidad: '', ubicacion: '', tipo_espacio_id: '' });
      mostrarToast('exito', 'Espacio creado correctamente');
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al crear el espacio');
    }
  };

  const handleEditar = (espacio) => {
    setEspacioEditando({ ...espacio, tipo_espacio_id: espacio.tipo_espacio_id || '' });
    setModalEditar(true);
  };

  const handleGuardarEdicion = async () => {
    try {
      const { data } = await api.put(`/espacios/${espacioEditando.id}`, {
        nombre: espacioEditando.nombre,
        capacidad: Number(espacioEditando.capacidad),
        ubicacion: espacioEditando.ubicacion,
        estado: espacioEditando.estado,
        tipo_espacio_id: espacioEditando.tipo_espacio_id,
      });
      setEspacios(prev => prev.map(e => e.id === data.id ? { ...data, tipo_nombre: e.tipo_nombre } : e));
      setModalEditar(false);
      mostrarToast('exito', 'Espacio actualizado correctamente');
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al actualizar el espacio');
    }
  };

  const inputStyle = { padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' };

  if (cargando) return <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando espacios...</p>;

  if (usuario?.rol !== 'admin') {
    return <p style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Acceso denegado. Se requiere rol de administrador.</p>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', boxSizing: 'border-box' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937' }}>Gestión de Espacios</h2>
          <p style={{ color: '#6b7280', margin: '0.2rem 0 0 0', fontSize: '0.95rem' }}>Administra los espacios del Instituto</p>
        </div>
        <button
          onClick={() => setModalCrear(true)}
          style={{ backgroundColor: '#c62828', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Agregar nuevo espacio
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafa', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Nombre</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Tipo</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Capacidad</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Ubicación</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Estado</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {espacios.map((e, idx) => {
              let badgeBg = '#e8f5e9', badgeColor = '#2e7d32';
              const estadoStr = e.estado?.toLowerCase() || 'disponible';
              if (estadoStr.includes('mantenimiento')) { badgeBg = '#fff3cd'; badgeColor = '#856404'; }
              else if (estadoStr.includes('inactivo')) { badgeBg = '#f8d7da'; badgeColor = '#58151c'; }

              const destacado = e.id === espacioDestacadoId;
              return (
                <tr
                  key={e.id}
                  ref={destacado ? filaDestacadaRef : null}
                  style={{
                    borderBottom: idx < espacios.length - 1 ? '1px solid #f0f0f0' : 'none',
                    ...(destacado && { backgroundColor: '#fff7ed', borderLeft: '4px solid #c62828' }),
                  }}
                >
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '500', color: '#1f2937', fontSize: '0.95rem' }}>{e.nombre}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.95rem' }}>{e.tipo_nombre || e.tipo || 'General'}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.95rem' }}>{e.capacidad} personas</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.95rem' }}>{e.ubicacion}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ backgroundColor: badgeBg, color: badgeColor, padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '500', textTransform: 'capitalize' }}>
                      {e.estado || 'Disponible'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                      <button onClick={() => handleReservar(e)} title="Reservar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: '0.2rem', display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </button>
                      <button onClick={() => handleEditar(e)} title="Editar espacio" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', padding: '0.2rem', display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button onClick={() => handleEliminar(e)} title="Eliminar espacio" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', padding: '0.2rem', display: 'flex', alignItems: 'center' }}>
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
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>No hay espacios registrados.</p>
          </div>
        )}
      </div>

      {/* Modal Crear */}
      {modalCrear && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Nuevo espacio</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input placeholder="Nombre *" value={nuevoEspacio.nombre} onChange={e => setNuevoEspacio({ ...nuevoEspacio, nombre: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Capacidad *" value={nuevoEspacio.capacidad} onChange={e => setNuevoEspacio({ ...nuevoEspacio, capacidad: e.target.value })} style={inputStyle} />
              <input placeholder="Ubicación" value={nuevoEspacio.ubicacion} onChange={e => setNuevoEspacio({ ...nuevoEspacio, ubicacion: e.target.value })} style={inputStyle} />
              <select value={nuevoEspacio.tipo_espacio_id} onChange={e => setNuevoEspacio({ ...nuevoEspacio, tipo_espacio_id: e.target.value })} style={inputStyle}>
                <option value="">Tipo de espacio *</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalCrear(false)} style={{ padding: '0.7rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', background: 'white' }}>Cancelar</button>
              <button onClick={handleCrear} style={{ padding: '0.7rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#c62828', color: 'white', fontWeight: '600' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modalEditar && espacioEditando && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Editar espacio</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input placeholder="Nombre *" value={espacioEditando.nombre} onChange={e => setEspacioEditando({ ...espacioEditando, nombre: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Capacidad *" value={espacioEditando.capacidad} onChange={e => setEspacioEditando({ ...espacioEditando, capacidad: e.target.value })} style={inputStyle} />
              <input placeholder="Ubicación" value={espacioEditando.ubicacion} onChange={e => setEspacioEditando({ ...espacioEditando, ubicacion: e.target.value })} style={inputStyle} />
              <select value={espacioEditando.estado} onChange={e => setEspacioEditando({ ...espacioEditando, estado: e.target.value })} style={inputStyle}>
                <option value="disponible">Disponible</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="inactivo">Inactivo</option>
              </select>
              <select value={espacioEditando.tipo_espacio_id} onChange={e => setEspacioEditando({ ...espacioEditando, tipo_espacio_id: e.target.value })} style={inputStyle}>
                <option value="">Tipo de espacio *</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalEditar(false)} style={{ padding: '0.7rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', background: 'white' }}>Cancelar</button>
              <button onClick={handleGuardarEdicion} style={{ padding: '0.7rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#c62828', color: 'white', fontWeight: '600' }}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {confirmandoEliminar && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(17,3,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmandoEliminar(null); }}
        >
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 16px 48px rgba(17,3,42,0.22)', fontFamily: '"Inter", sans-serif' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#11032a', margin: '0 0 12px' }}>Eliminar espacio</h2>
            <p style={{ color: '#4b3f6b', fontSize: '14px', margin: '0 0 28px', lineHeight: '1.6' }}>
              ¿Eliminar <strong>"{confirmandoEliminar.nombre}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmandoEliminar(null)} style={{ padding: '10px 20px', border: '1px solid #e0dce8', borderRadius: '10px', background: 'white', color: '#6b5f82', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={confirmarEliminar} style={{ background: '#d92a00', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: toast.tipo === 'exito' ? '#16a34a' : '#d92a00',
          color: 'white', borderRadius: '12px', padding: '13px 22px',
          fontSize: '14px', fontWeight: '600', boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
          zIndex: 3000, display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap',
        }}>
          {toast.tipo === 'exito'
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
          {toast.mensaje}
        </div>
      )}

    </div>
  );
};

export default GestionEspacios;
