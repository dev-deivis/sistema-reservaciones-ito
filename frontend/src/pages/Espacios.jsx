import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Espacios = () => {
  const [espacios, setEspacios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/espacios')
      .then(({ data }) => setEspacios(data))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p>Cargando espacios...</p>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Espacios Disponibles</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {espacios.map((e) => (
          <div className="card" key={e.id}>
            <h3>{e.nombre}</h3>
            <p style={{ color: '#666', marginBottom: '0.5rem' }}>{e.tipo_nombre}</p>
            <p>Capacidad: <strong>{e.capacidad}</strong> personas</p>
            <p>Ubicación: {e.ubicacion}</p>
            <p style={{ marginTop: '0.5rem' }}>
              <span className={`badge badge-${e.estado}`}>{e.estado}</span>
            </p>
          </div>
        ))}
      </div>
      {espacios.length === 0 && <p>No hay espacios registrados.</p>}
    </div>
  );
};

export default Espacios;
