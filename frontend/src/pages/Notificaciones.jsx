import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    api.get('/notificaciones')
      .then(({ data }) => setNotificaciones(data))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const marcarLeida = async (id) => {
    await api.patch(`/notificaciones/${id}/leer`);
    cargar();
  };

  const marcarTodas = async () => {
    await api.patch('/notificaciones/leer-todas');
    cargar();
  };

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Notificaciones</h2>
        <button className="btn btn-secondary" onClick={marcarTodas}>Marcar todas como leídas</button>
      </div>
      {notificaciones.length === 0 && <p>Sin notificaciones.</p>}
      {notificaciones.map((n) => (
        <div
          className="card"
          key={n.id}
          style={{ borderLeft: n.leida ? '4px solid #ccc' : '4px solid #1976d2' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: n.leida ? 'normal' : 'bold' }}>{n.mensaje}</p>
              {n.espacio_nombre && <p style={{ color: '#666', fontSize: '0.85rem' }}>Espacio: {n.espacio_nombre}</p>}
              <p style={{ color: '#999', fontSize: '0.8rem' }}>{new Date(n.created_at).toLocaleString('es-MX')}</p>
            </div>
            {!n.leida && (
              <button className="btn btn-secondary" onClick={() => marcarLeida(n.id)}>Marcar leída</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notificaciones;
