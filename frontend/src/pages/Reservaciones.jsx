import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ReservacionCard from '../components/ReservacionCard';

const FILTROS = ['Todas', 'Activas', 'Canceladas', 'Completadas'];

const Reservaciones = () => {
  const { usuario } = useAuth();
  const [reservaciones, setReservaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('Todas');

  const cargar = () => {
    setCargando(true);
    const url = usuario?.rol === 'admin' ? '/reservaciones' : '/reservaciones';
    api.get(url)
      .then(({ data }) => setReservaciones(data))
      .catch(() => setError('Error al cargar reservaciones'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const cancelar = async (id) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reservación?')) return;
    try {
      await api.patch(`/reservaciones/${id}/cancelar`);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar');
    }
  };

  const reservacionesFiltradas = reservaciones.filter((r) => {
    if (filtro === 'Todas') return true;
    if (filtro === 'Activas') return r.estado === 'pendiente' || r.estado === 'confirmada';
    if (filtro === 'Canceladas') return r.estado === 'cancelada';
    if (filtro === 'Completadas') return r.estado === 'completada';
    return true;
  });

  const titulo = usuario?.rol === 'admin' ? 'Todas las Reservaciones' : 'Mis Reservaciones';
  const subtitulo = usuario?.rol === 'admin'
    ? 'Consulta todas las reservaciones del sistema'
    : 'Consulta y gestiona tus reservaciones';

  return (
   <div style={{ padding: "32px 36px", width: "100%" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
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

      {/* Filtros */}
      <div style={{
        display: 'flex', gap: '4px', background: 'white',
        borderRadius: '10px', border: '1px solid #e5e7eb',
        padding: '4px', marginBottom: '20px', width: 'fit-content',
      }}>
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '8px 20px', borderRadius: '7px', border: 'none',
              background: filtro === f ? '#c0392b' : 'transparent',
              color: filtro === f ? 'white' : '#6b7280',
              fontWeight: filtro === f ? '600' : '400',
              fontSize: '14px', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', color: '#b91c1c', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {cargando && (
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Cargando reservaciones...</p>
      )}

      {!cargando && reservacionesFiltradas.length === 0 && (
        <div style={{
          background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
          padding: '48px', textAlign: 'center', color: '#9ca3af',
        }}>
          <p style={{ fontSize: '16px', margin: 0 }}>No hay reservaciones {filtro !== 'Todas' ? `en "${filtro}"` : ''}.</p>
        </div>
      )}

      {!cargando && reservacionesFiltradas.map((r) => (
        <ReservacionCard key={r.id} reservacion={r} onCancelar={cancelar} />
      ))}
    </div>
  );
};

export default Reservaciones;