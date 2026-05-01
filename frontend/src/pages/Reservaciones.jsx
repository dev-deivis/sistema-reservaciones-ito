import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Reservaciones = () => {
  const [reservaciones, setReservaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = () => {
    setCargando(true);
    api.get('/reservaciones')
      .then(({ data }) => setReservaciones(data))
      .catch(() => setError('Error al cargar reservaciones'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const cancelar = async (id) => {
    if (!confirm('¿Cancelar esta reservación?')) return;
    try {
      await api.patch(`/reservaciones/${id}/cancelar`);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar');
    }
  };

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Mis Reservaciones</h2>
        <Link to="/reservaciones/nueva"><button className="btn btn-primary">+ Nueva</button></Link>
      </div>
      {error && <p className="error-message">{error}</p>}
      {reservaciones.length === 0 && <p>No tienes reservaciones.</p>}
      {reservaciones.map((r) => (
        <div className="card" key={r.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>{r.espacio_nombre}</h3>
              <p>Inicio: {new Date(r.fecha_inicio).toLocaleString('es-MX')}</p>
              <p>Fin: {new Date(r.fecha_fin).toLocaleString('es-MX')}</p>
              {r.motivo && <p>Motivo: {r.motivo}</p>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`badge badge-${r.estado}`}>{r.estado}</span>
              {r.estado !== 'cancelada' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <button className="btn btn-danger" onClick={() => cancelar(r.id)}>Cancelar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reservaciones;
