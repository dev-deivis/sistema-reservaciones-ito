import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const NuevaReservacion = () => {
  const [espacios, setEspacios] = useState([]);
  const [form, setForm] = useState({ espacio_id: '', fecha_inicio: '', fecha_fin: '', motivo: '' });
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/espacios').then(({ data }) => setEspacios(data));
  }, []);

  const verificar = async () => {
    if (!form.espacio_id || !form.fecha_inicio || !form.fecha_fin) return;
    try {
      const { data } = await api.get('/disponibilidad/espacio', {
        params: { espacio_id: form.espacio_id, fecha_inicio: form.fecha_inicio, fecha_fin: form.fecha_fin },
      });
      setDisponibilidad(data.disponible);
    } catch {
      setDisponibilidad(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await api.post('/reservaciones', form);
      navigate('/reservaciones');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear reservación');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Nueva Reservación</h2>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Espacio</label>
            <select
              value={form.espacio_id}
              onChange={(e) => { setForm({ ...form, espacio_id: e.target.value }); setDisponibilidad(null); }}
              required
            >
              <option value="">Selecciona un espacio</option>
              {espacios.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre} (cap. {e.capacidad})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Fecha y hora de inicio</label>
            <input
              type="datetime-local"
              value={form.fecha_inicio}
              onChange={(e) => { setForm({ ...form, fecha_inicio: e.target.value }); setDisponibilidad(null); }}
              required
            />
          </div>
          <div className="form-group">
            <label>Fecha y hora de fin</label>
            <input
              type="datetime-local"
              value={form.fecha_fin}
              onChange={(e) => { setForm({ ...form, fecha_fin: e.target.value }); setDisponibilidad(null); }}
              required
            />
          </div>
          <div className="form-group">
            <label>Motivo (opcional)</label>
            <textarea
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              rows={3}
            />
          </div>

          <button type="button" className="btn btn-secondary" onClick={verificar} style={{ marginRight: '0.5rem' }}>
            Verificar disponibilidad
          </button>

          {disponibilidad !== null && (
            <span className={`badge badge-${disponibilidad ? 'disponible' : 'no-disponible'}`} style={{ marginRight: '0.5rem' }}>
              {disponibilidad ? 'Disponible' : 'No disponible'}
            </span>
          )}

          {error && <p className="error-message" style={{ marginTop: '0.5rem' }}>{error}</p>}

          <div style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary" type="submit" disabled={cargando}>
              {cargando ? 'Creando...' : 'Crear Reservación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevaReservacion;
