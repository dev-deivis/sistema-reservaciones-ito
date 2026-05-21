import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ReservacionCard from '../components/ReservacionCard';
import useWindowSize from '../hooks/useWindowSize';

const FILTROS = ['Todas', 'Activas', 'Canceladas', 'Completadas'];

const Reservaciones = () => {
  const { usuario } = useAuth();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const [reservaciones, setReservaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [confirmacion, setConfirmacion] = useState(null);
  const [toast, setToast] = useState(null);

  const mostrarToast = (tipo, mensaje) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 3500);
  };

  const cargar = () => {
    setCargando(true);
    const url = usuario?.rol === 'admin' ? '/reservaciones' : '/reservaciones/mis-reservaciones';
    api.get(url)
      .then(({ data }) => setReservaciones(data))
      .catch(() => setError('Error al cargar reservaciones'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const cancelar = (id) => {
    setConfirmacion({
      mensaje: '¿Estás seguro de que deseas cancelar esta reservación? Esta acción no se puede deshacer.',
      onConfirmar: async () => {
        try {
          await api.patch(`/reservaciones/${id}/cancelar`);
          cargar();
          mostrarToast('exito', 'Reservación cancelada correctamente');
        } catch (err) {
          mostrarToast('error', err.response?.data?.error || 'Error al cancelar');
        }
      },
    });
  };

  const modificar = (reservacionActualizada) => {
    setReservaciones(prev =>
      prev.map(r => r.id === reservacionActualizada.id ? { ...r, ...reservacionActualizada } : r)
    );
    mostrarToast('exito', 'Reservación modificada correctamente');
  };

  const reservacionesFiltradas = reservaciones.filter((r) => {
    const porEstado = filtro === 'Todas' ? true
      : filtro === 'Activas' ? (r.estado === 'pendiente' || r.estado === 'confirmada')
      : filtro === 'Canceladas' ? r.estado === 'cancelada'
      : filtro === 'Completadas' ? r.estado === 'completada'
      : true;
    if (!porEstado) return false;
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      r.espacio_nombre?.toLowerCase().includes(q) ||
      r.motivo?.toLowerCase().includes(q) ||
      r.usuario_nombre?.toLowerCase().includes(q)
    );
  });

  const titulo = usuario?.rol === 'admin' ? 'Todas las Reservaciones' : 'Mis Reservaciones';
  const subtitulo = usuario?.rol === 'admin'
    ? 'Consulta todas las reservaciones del sistema'
    : 'Consulta y gestiona tus reservaciones';

  return (
    <div style={{ padding: isMobile ? '16px' : '32px 36px', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
            {titulo}
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{subtitulo}</p>
        </div>
        <Link to="/reservaciones/nueva">
          <button style={{
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            background: '#2563eb', color: 'white', fontWeight: '600',
            fontSize: '14px', cursor: 'pointer',
          }}>
            + Nueva
          </button>
        </Link>
      </div>

      {/* Filtros + Buscador */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', marginBottom: '20px', alignItems: isMobile ? 'stretch' : 'center' }}>
        <div style={{
          display: 'flex', gap: '4px', background: 'white',
          borderRadius: '10px', border: '1px solid #e5e7eb', padding: '4px',
          flexWrap: 'wrap',
        }}>
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                padding: isMobile ? '6px 12px' : '8px 20px', borderRadius: '7px', border: 'none',
                background: filtro === f ? '#c0392b' : 'transparent',
                color: filtro === f ? 'white' : '#6b7280',
                fontWeight: filtro === f ? '600' : '400',
                fontSize: isMobile ? '13px' : '14px', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? 'auto' : '220px' }}>
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder={usuario?.rol === 'admin' ? 'Buscar por espacio, motivo o usuario...' : 'Buscar por espacio o motivo...'}
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%', padding: '9px 14px 9px 36px',
              borderRadius: '10px', border: '1px solid #e5e7eb',
              fontSize: '14px', color: '#111827', background: 'white',
              boxSizing: 'border-box', outline: 'none',
            }}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                border: 'none', background: 'none', cursor: 'pointer',
                color: '#9ca3af', display: 'flex', alignItems: 'center', padding: '2px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', color: '#b91c1c', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      {cargando && <p style={{ color: '#6b7280', fontSize: '14px' }}>Cargando reservaciones...</p>}
      {!cargando && reservacionesFiltradas.length === 0 && (
        <div style={{
          background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
          padding: '48px', textAlign: 'center', color: '#9ca3af',
        }}>
          <p style={{ fontSize: '16px', margin: 0 }}>
            {busqueda
              ? `No se encontraron resultados para "${busqueda}".`
              : `No hay reservaciones${filtro !== 'Todas' ? ` en "${filtro}"` : ''}.`}
          </p>
        </div>
      )}
      {!cargando && reservacionesFiltradas.map((r) => (
        <ReservacionCard key={r.id} reservacion={r} onCancelar={cancelar} onModificar={modificar} />
      ))}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
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

      {/* Modal de confirmación */}
      {confirmacion && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(17, 3, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmacion(null); }}
        >
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 16px 48px rgba(17,3,42,0.22)', fontFamily: '"Inter", sans-serif' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#11032a', margin: '0 0 12px' }}>Cancelar reservación</h2>
            <p style={{ color: '#4b3f6b', fontSize: '14px', margin: '0 0 28px', lineHeight: '1.6' }}>{confirmacion.mensaje}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmacion(null)} style={{ padding: '10px 20px', border: '1px solid #e0dce8', borderRadius: '10px', background: 'white', color: '#6b5f82', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Volver
              </button>
              <button onClick={() => { confirmacion.onConfirmar(); setConfirmacion(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#d92a00', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservaciones;
