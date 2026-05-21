import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const IconPersona = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconCalendario = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconEspacio = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const badges = {
  pendiente:  { bg: '#fef9c3', color: '#854d0e', label: 'Pendiente' },
  confirmada: { bg: '#dcfce7', color: '#166534', label: 'Confirmada' },
  cancelada:  { bg: '#f1f5f9', color: '#475569', label: 'Cancelada' },
  completada: { bg: '#dbeafe', color: '#1e40af', label: 'Completada' },
};

const isoToLocal = (iso) => {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ReservacionCard = ({ reservacion, onCancelar, onModificar }) => {
  const { usuario } = useAuth();
  const r = reservacion;
  const badge = badges[r.estado] || badges.pendiente;

  const [mostrarModal, setMostrarModal] = useState(false);
  const [formMod, setFormMod] = useState({ fecha_inicio: '', fecha_fin: '', motivo: '' });
  const [guardando, setGuardando] = useState(false);
  const [errorMod, setErrorMod] = useState('');

  const puedeModificar = (r.estado === 'pendiente' || r.estado === 'confirmada') &&
    (usuario?.rol === 'admin' || usuario?.id === r.usuario_id);

  const fechaInicio = new Date(r.fecha_inicio).toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const fechaFin = new Date(r.fecha_fin).toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const abrirModal = () => {
    setFormMod({
      fecha_inicio: isoToLocal(r.fecha_inicio),
      fecha_fin: isoToLocal(r.fecha_fin),
      motivo: r.motivo || '',
    });
    setErrorMod('');
    setMostrarModal(true);
  };

  const handleGuardar = async () => {
    if (!formMod.fecha_inicio || !formMod.fecha_fin) {
      setErrorMod('Debes ingresar ambas fechas.');
      return;
    }
    if (new Date(formMod.fecha_inicio) >= new Date(formMod.fecha_fin)) {
      setErrorMod('La fecha de inicio debe ser anterior a la fecha de fin.');
      return;
    }
    setGuardando(true);
    setErrorMod('');
    try {
      const { data } = await api.put(`/reservaciones/${r.id}`, {
        fecha_inicio: formMod.fecha_inicio,
        fecha_fin: formMod.fecha_fin,
        motivo: formMod.motivo,
      });
      setMostrarModal(false);
      onModificar && onModificar(data);
    } catch (err) {
      setErrorMod(err.response?.data?.error || 'Error al modificar la reservación');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div style={{
        background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
        padding: '20px 24px', marginBottom: '16px',
        display: 'flex', alignItems: 'flex-start', gap: '16px',
      }}>
        {/* Ícono espacio */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px',
          background: '#fee2e2', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <IconEspacio />
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          {/* Nombre + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '700', fontSize: '16px', color: '#111827' }}>
              {r.espacio_nombre}
            </span>
            <span style={{
              background: badge.bg, color: badge.color,
              borderRadius: '20px', padding: '2px 10px',
              fontSize: '12px', fontWeight: '600',
            }}>
              {badge.label}
            </span>
          </div>

          {/* Usuario */}
          {r.usuario_nombre && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px', marginBottom: '6px' }}>
              <IconPersona />
              <span>{r.usuario_nombre}</span>
            </div>
          )}

          {/* Fechas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px' }}>
              <IconCalendario />
              <span>Inicio: {fechaInicio}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px' }}>
              <IconCalendario />
              <span>Fin: {fechaFin}</span>
            </div>
          </div>

          {/* Motivo */}
          {r.motivo && (
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
              Motivo: {r.motivo}
            </p>
          )}
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          {puedeModificar && (
            <button
              onClick={abrirModal}
              style={{
                padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #2563eb',
                background: 'white', color: '#2563eb', fontWeight: '600',
                fontSize: '13px', cursor: 'pointer',
              }}
            >
              Modificar
            </button>
          )}
          {puedeModificar && (
            <button
              onClick={() => onCancelar(r.id)}
              style={{
                padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #c0392b',
                background: 'white', color: '#c0392b', fontWeight: '600',
                fontSize: '13px', cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Modal modificar */}
      {mostrarModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            {/* Cabecera */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>Modificar reservación</h3>
              <button onClick={() => setMostrarModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Cuerpo */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Fecha y hora inicio</label>
                <input
                  type="datetime-local"
                  value={formMod.fecha_inicio}
                  onChange={(e) => setFormMod({ ...formMod, fecha_inicio: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Fecha y hora fin</label>
                <input
                  type="datetime-local"
                  value={formMod.fecha_fin}
                  onChange={(e) => setFormMod({ ...formMod, fecha_fin: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Motivo</label>
                <textarea
                  rows={3}
                  value={formMod.motivo}
                  onChange={(e) => setFormMod({ ...formMod, motivo: e.target.value })}
                  placeholder="Describe el motivo de la reservación"
                  style={{ width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {errorMod && (
                <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: 0 }}>{errorMod}</p>
              )}

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setMostrarModal(false)}
                  disabled={guardando}
                  style={{ padding: '0.7rem 1.2rem', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={guardando}
                  style={{ padding: '0.7rem 1.2rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '600', fontSize: '0.9rem', cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1 }}
                >
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReservacionCard;
