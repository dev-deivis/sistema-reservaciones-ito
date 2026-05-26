import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import useWindowSize from '../hooks/useWindowSize';

// ── Slots de media hora 7:00 – 20:00 ──────────────────────────
const HORAS = [];
for (let h = 7; h <= 20; h++) {
  HORAS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 20) HORAS.push(`${String(h).padStart(2, '0')}:30`);
}

const formatHora = (h) => {
  const [hh, mm] = h.split(':').map(Number);
  const periodo = hh < 12 ? 'AM' : 'PM';
  const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${h12}:${String(mm).padStart(2, '0')} ${periodo}`;
};

const esFinDeSemana = (fechaStr) => {
  if (!fechaStr) return false;
  const [y, m, d] = fechaStr.split('-').map(Number);
  const dia = new Date(y, m - 1, d).getDay();
  return dia === 0 || dia === 6;
};

const hoy = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

// ── Íconos ──────────────────────────────────────────────────
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

// Convierte ISO UTC → string local "YYYY-MM-DDTHH:MM"
const isoToLocal = (iso) => {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Redondea a la opción de HORAS más cercana (hacia abajo)
const snapHora = (horaStr) => {
  if (!horaStr) return '';
  const [hh, mm] = horaStr.split(':').map(Number);
  const snapped = mm < 30 ? `${String(hh).padStart(2, '0')}:00` : `${String(hh).padStart(2, '0')}:30`;
  return HORAS.includes(snapped) ? snapped : horaStr;
};

// ── Componente ───────────────────────────────────────────────
const ReservacionCard = ({ reservacion, onCancelar, onModificar }) => {
  const { usuario } = useAuth();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const r = reservacion;
  const badge = badges[r.estado] || badges.pendiente;

  // Estado del modal
  const [mostrarModal, setMostrarModal]         = useState(false);
  const [formMod, setFormMod]                   = useState({ fecha: '', hora_inicio: '', hora_fin: '', motivo: '' });
  const [guardando, setGuardando]               = useState(false);
  const [errorMod, setErrorMod]                 = useState('');
  const [errFechaMod, setErrFechaMod]           = useState('');
  const [errMotivoMod, setErrMotivoMod]         = useState('');
  const [disponibilidadMod, setDisponibilidadMod] = useState(null); // null | true | false
  const [verificandoMod, setVerificandoMod]     = useState(false);

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

  // ── Abrir modal pre-llenado con los datos actuales ─────────
  const abrirModal = () => {
    const localInicio = isoToLocal(r.fecha_inicio);
    const localFin    = isoToLocal(r.fecha_fin);
    const [fecha, tiempoInicio] = localInicio.split('T');
    const horaInicio = snapHora(tiempoInicio.slice(0, 5));
    const horaFin    = snapHora(localFin.split('T')[1].slice(0, 5));

    setFormMod({ fecha, hora_inicio: horaInicio, hora_fin: horaFin, motivo: r.motivo || '' });
    setDisponibilidadMod(null);
    setErrorMod('');
    setErrFechaMod('');
    setErrMotivoMod('');
    setMostrarModal(true);
  };

  // ── Helpers de fecha ───────────────────────────────────────
  const getFechaInicioMod = () =>
    formMod.fecha && formMod.hora_inicio ? `${formMod.fecha}T${formMod.hora_inicio}:00` : '';
  const getFechaFinMod = () =>
    formMod.fecha && formMod.hora_fin ? `${formMod.fecha}T${formMod.hora_fin}:00` : '';

  // ── Slots de hora (siempre incluye el valor actual pre-llenado) ──
  const ahora = new Date();
  const horasInicioMod = HORAS.slice(0, -1).filter((h) => {
    if (formMod.fecha !== hoy) return true;
    if (h === formMod.hora_inicio) return true; // preserva el slot actual aunque sea pasado
    const [hh, mm] = h.split(':').map(Number);
    const slot = new Date(ahora);
    slot.setHours(hh, mm, 0, 0);
    return slot > ahora;
  });
  const horasFinMod = formMod.hora_inicio
    ? HORAS.filter((h) => h > formMod.hora_inicio)
    : [];

  // ── Resumen legible del horario ────────────────────────────
  const resumenHorarioMod = (() => {
    if (!formMod.fecha || !formMod.hora_inicio || !formMod.hora_fin) return null;
    const [y, m, d] = formMod.fecha.split('-').map(Number);
    const fecha = new Date(y, m - 1, d);
    const nombreDia  = fecha.toLocaleDateString('es-MX', { weekday: 'long' });
    const nombreFecha = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
    return `${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} ${nombreFecha} · ${formatHora(formMod.hora_inicio)} – ${formatHora(formMod.hora_fin)}`;
  })();

  // ── Manejadores ────────────────────────────────────────────
  const handleChangeMod = (e) => {
    const { name, value } = e.target;
    setDisponibilidadMod(null);
    setErrorMod('');

    if (name === 'fecha') {
      setErrFechaMod(esFinDeSemana(value) ? 'Solo se permiten reservaciones de lunes a viernes.' : '');
      setFormMod(p => ({ ...p, fecha: value, hora_inicio: '', hora_fin: '' }));
      return;
    }
    if (name === 'hora_inicio') {
      setFormMod(p => ({ ...p, hora_inicio: value, hora_fin: '' }));
      return;
    }
    if (name === 'motivo') {
      setErrMotivoMod(value.length > 0 && value.length < 15 ? 'El motivo debe tener al menos 15 caracteres.' : '');
    }
    setFormMod(p => ({ ...p, [name]: value }));
  };

  const verificarDisponibilidadMod = async () => {
    setErrorMod('');
    if (!formMod.fecha || !formMod.hora_inicio || !formMod.hora_fin) {
      setErrorMod('Completa la fecha y el horario antes de verificar.');
      return;
    }
    if (errFechaMod) { setErrorMod(errFechaMod); return; }
    const diffMin = (new Date(getFechaFinMod()) - new Date(getFechaInicioMod())) / 60000;
    if (diffMin < 30) { setErrorMod('La reservación debe durar al menos 30 minutos.'); return; }

    setVerificandoMod(true);
    try {
      const res = await api.post('/disponibilidad/verificar', {
        espacioId: r.espacio_id,
        fecha_inicio: getFechaInicioMod(),
        fecha_fin: getFechaFinMod(),
      });
      setDisponibilidadMod(res.data.disponible);
    } catch (err) {
      setErrorMod(err.response?.data?.error || 'Error al verificar disponibilidad.');
    } finally {
      setVerificandoMod(false);
    }
  };

  const handleGuardar = async () => {
    if (!formMod.fecha || !formMod.hora_inicio || !formMod.hora_fin) {
      setErrorMod('Debes completar la fecha y el horario.');
      return;
    }
    if (errFechaMod) { setErrorMod(errFechaMod); return; }
    const diffMin = (new Date(getFechaFinMod()) - new Date(getFechaInicioMod())) / 60000;
    if (diffMin < 30)  { setErrorMod('La reservación debe durar al menos 30 minutos.'); return; }
    if (diffMin > 480) { setErrorMod('La reservación no puede durar más de 8 horas.'); return; }
    if (errMotivoMod)  { setErrorMod(errMotivoMod); return; }

    setGuardando(true);
    setErrorMod('');
    try {
      const { data } = await api.put(`/reservaciones/${r.id}`, {
        fecha_inicio: getFechaInicioMod(),
        fecha_fin: getFechaFinMod(),
        motivo: formMod.motivo,
      });
      setMostrarModal(false);
      onModificar && onModificar(data);
    } catch (err) {
      setErrorMod(err.response?.data?.error || 'Error al modificar la reservación.');
    } finally {
      setGuardando(false);
    }
  };

  // ── Estilos compartidos del modal ──────────────────────────
  const inputMod = {
    width: '100%', padding: '10px 13px',
    borderRadius: '8px', border: '1.5px solid #d1d5db',
    fontSize: '14px', color: '#111827', background: 'white',
    boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
  };
  const inputModDisabled = { ...inputMod, background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' };
  const labelMod = { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px', display: 'block' };

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      {/* ── Card ── */}
      <div style={{
        background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
        padding: '16px 20px', marginBottom: '12px',
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'flex-start', gap: '14px',
      }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px',
            background: '#fee2e2', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <IconEspacio />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '700', fontSize: '16px', color: '#111827' }}>{r.espacio_nombre}</span>
              <span style={{ background: badge.bg, color: badge.color, borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' }}>
                {badge.label}
              </span>
            </div>
            {r.usuario_nombre && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px', marginBottom: '6px' }}>
                <IconPersona /><span>{r.usuario_nombre}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px' }}>
                <IconCalendario /><span>Inicio: {fechaInicio}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px' }}>
                <IconCalendario /><span>Fin: {fechaFin}</span>
              </div>
            </div>
            {r.motivo && <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px', marginBottom: 0 }}>Motivo: {r.motivo}</p>}
          </div>
        </div>

        {/* Botones */}
        {puedeModificar && (
          <div style={{
            display: 'flex', flexDirection: isMobile ? 'row' : 'column',
            gap: '8px', flexShrink: 0, marginTop: isMobile ? '4px' : 0,
          }}>
            <button
              onClick={abrirModal}
              style={{
                flex: isMobile ? 1 : 'none',
                padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #2563eb',
                background: 'white', color: '#2563eb', fontWeight: '600',
                fontSize: '13px', cursor: 'pointer',
              }}
            >
              Modificar
            </button>
            <button
              onClick={() => onCancelar(r.id)}
              style={{
                flex: isMobile ? 1 : 'none',
                padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #c0392b',
                background: 'white', color: '#c0392b', fontWeight: '600',
                fontSize: '13px', cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* ── Modal modificar ── */}
      {mostrarModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(17, 3, 42, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '16px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setMostrarModal(false); }}
        >
          <div style={{
            background: 'white', borderRadius: '16px',
            width: '100%', maxWidth: '500px',
            boxShadow: '0 20px 48px rgba(17,3,42,0.22)',
            maxHeight: '90vh', overflowY: 'auto',
            fontFamily: '"Inter", sans-serif',
          }}>

            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 22px', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0,
              background: 'white', borderRadius: '16px 16px 0 0', zIndex: 1,
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                  Modificar reservación
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>
                  Cambia la fecha, horario o motivo
                </p>
              </div>
              <button
                onClick={() => setMostrarModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '6px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Espacio (solo lectura) */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: '#f9fafb', borderRadius: '10px', padding: '10px 14px',
                border: '1.5px solid #e5e7eb',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <IconEspacio />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Espacio</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#111827', fontWeight: '700' }}>{r.espacio_nombre}</p>
                </div>
              </div>

              {/* Fecha */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={labelMod}>
                  Fecha <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formMod.fecha}
                  onChange={handleChangeMod}
                  min={hoy}
                  style={errFechaMod ? { ...inputMod, borderColor: '#f87171' } : inputMod}
                />
                {errFechaMod ? (
                  <p style={{ margin: 0, fontSize: '12px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errFechaMod}
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                    Solo lunes a viernes · Horario 7:00 AM – 8:00 PM
                  </p>
                )}
              </div>

              {/* Horario */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={labelMod}>
                  Horario <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {/* Inicio */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Inicio</span>
                    <select
                      name="hora_inicio"
                      value={formMod.hora_inicio}
                      onChange={handleChangeMod}
                      disabled={!formMod.fecha || !!errFechaMod}
                      style={!formMod.fecha || errFechaMod ? inputModDisabled : inputMod}
                    >
                      <option value="">-- Hora --</option>
                      {horasInicioMod.map((h) => (
                        <option key={h} value={h}>{formatHora(h)}</option>
                      ))}
                    </select>
                  </div>

                  <span style={{ color: '#9ca3af', fontSize: '18px', marginTop: '18px', flexShrink: 0 }}>→</span>

                  {/* Fin */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Fin</span>
                    <select
                      name="hora_fin"
                      value={formMod.hora_fin}
                      onChange={handleChangeMod}
                      disabled={!formMod.hora_inicio}
                      style={!formMod.hora_inicio ? inputModDisabled : inputMod}
                    >
                      <option value="">-- Hora --</option>
                      {horasFinMod.map((h) => (
                        <option key={h} value={h}>{formatHora(h)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resumen legible */}
                {resumenHorarioMod && (
                  <div style={{
                    marginTop: '4px', padding: '8px 13px', borderRadius: '8px',
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                    fontSize: '13px', fontWeight: '600', color: '#15803d',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {resumenHorarioMod}
                  </div>
                )}
              </div>

              {/* Motivo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={labelMod}>
                  Motivo{' '}
                  <span style={{ fontSize: '12px', fontWeight: '400', color: '#6b7280' }}>(opcional)</span>
                </label>
                <textarea
                  name="motivo"
                  rows={3}
                  maxLength={50}
                  value={formMod.motivo}
                  onChange={handleChangeMod}
                  placeholder="Describe el propósito de la reservación..."
                  style={{ ...inputMod, resize: 'vertical', borderColor: errMotivoMod ? '#f87171' : '#d1d5db' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {errMotivoMod
                    ? <p style={{ margin: 0, fontSize: '12px', color: '#b91c1c' }}>{errMotivoMod}</p>
                    : <span />
                  }
                  <p style={{ margin: 0, fontSize: '12px', color: formMod.motivo.length >= 45 ? '#b45309' : '#9ca3af' }}>
                    {formMod.motivo.length}/50
                  </p>
                </div>
              </div>

              {/* Error general */}
              {errorMod && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '8px', padding: '10px 14px',
                  color: '#b91c1c', fontSize: '13px',
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {errorMod}
                </div>
              )}

              {/* Indicador de disponibilidad */}
              {disponibilidadMod === true && (
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: '8px', padding: '10px 14px',
                  color: '#15803d', fontSize: '13px', fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  El espacio está disponible en ese horario.
                </div>
              )}
              {disponibilidadMod === false && (
                <div style={{
                  background: '#fffbeb', border: '1px solid #fde68a',
                  borderRadius: '8px', padding: '10px 14px',
                  color: '#92400e', fontSize: '13px', fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Hay conflicto en ese horario. Puedes elegir otro o guardar bajo tu responsabilidad.
                </div>
              )}

              {/* Botón verificar */}
              <button
                onClick={verificarDisponibilidadMod}
                disabled={verificandoMod || !formMod.fecha || !formMod.hora_inicio || !formMod.hora_fin}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '11px', borderRadius: '9px', border: 'none',
                  background: (!formMod.fecha || !formMod.hora_inicio || !formMod.hora_fin)
                    ? '#f3f4f6'
                    : verificandoMod ? '#9b2020' : '#b91c1c',
                  color: (!formMod.fecha || !formMod.hora_inicio || !formMod.hora_fin) ? '#9ca3af' : 'white',
                  fontWeight: '600', fontSize: '14px',
                  cursor: (!formMod.fecha || !formMod.hora_inicio || !formMod.hora_fin || verificandoMod) ? 'not-allowed' : 'pointer',
                  width: '100%', transition: 'background 0.2s',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {verificandoMod ? 'Verificando...' : 'Verificar disponibilidad'}
              </button>

              {/* Botones guardar / cerrar */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setMostrarModal(false)}
                  disabled={guardando}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '9px',
                    border: '1.5px solid #e0dce8', background: 'white',
                    color: '#6b5f82', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={guardando}
                  style={{
                    flex: 2, padding: '11px', borderRadius: '9px', border: 'none',
                    background: guardando ? '#1e40af' : '#2563eb',
                    color: 'white', fontWeight: '600', fontSize: '14px',
                    cursor: guardando ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'background 0.2s',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
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
