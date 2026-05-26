import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

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

// ── Componente ───────────────────────────────────────────────
const DisponibilidadCalendario = ({ espacio, onClose }) => {
  const navigate = useNavigate();

  const [form, setForm]           = useState({ fecha: '', hora_inicio: '', hora_fin: '' });
  const [errFecha, setErrFecha]   = useState('');
  const [resultado, setResultado] = useState(null); // null | { disponible, conflictos?, razon? }
  const [cargando, setCargando]   = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');

  // ── Slots filtrados ────────────────────────────────────────
  const ahora = new Date();
  const horasInicio = HORAS.slice(0, -1).filter((h) => {
    if (form.fecha !== hoy) return true;
    const [hh, mm] = h.split(':').map(Number);
    const slot = new Date(ahora);
    slot.setHours(hh, mm, 0, 0);
    return slot > ahora;
  });
  const horasFin = form.hora_inicio
    ? HORAS.filter((h) => h > form.hora_inicio)
    : [];

  // ── Helpers ────────────────────────────────────────────────
  const getFechaInicio = () =>
    form.fecha && form.hora_inicio ? `${form.fecha}T${form.hora_inicio}:00` : '';
  const getFechaFin = () =>
    form.fecha && form.hora_fin ? `${form.fecha}T${form.hora_fin}:00` : '';

  const resumenHorario = (() => {
    if (!form.fecha || !form.hora_inicio || !form.hora_fin) return null;
    const [y, m, d] = form.fecha.split('-').map(Number);
    const fecha = new Date(y, m - 1, d);
    const nombreDia   = fecha.toLocaleDateString('es-MX', { weekday: 'long' });
    const nombreFecha = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
    return `${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} ${nombreFecha} · ${formatHora(form.hora_inicio)} – ${formatHora(form.hora_fin)}`;
  })();

  const formularioCompleto = form.fecha && form.hora_inicio && form.hora_fin && !errFecha;

  // ── Handlers ───────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setResultado(null);
    setErrorMsg('');

    if (name === 'fecha') {
      setErrFecha(esFinDeSemana(value) ? 'Solo se permiten reservaciones de lunes a viernes.' : '');
      setForm(p => ({ ...p, fecha: value, hora_inicio: '', hora_fin: '' }));
      return;
    }
    if (name === 'hora_inicio') {
      setForm(p => ({ ...p, hora_inicio: value, hora_fin: '' }));
      return;
    }
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleVerificar = async () => {
    setErrorMsg('');
    if (!formularioCompleto) {
      setErrorMsg('Completa la fecha y el horario antes de verificar.');
      return;
    }
    const diffMin = (new Date(getFechaFin()) - new Date(getFechaInicio())) / 60000;
    if (diffMin < 30) { setErrorMsg('El rango debe ser de al menos 30 minutos.'); return; }

    setCargando(true);
    setResultado(null);
    try {
      const { data } = await api.post('/disponibilidad/verificar', {
        espacioId: espacio.id,
        fecha_inicio: getFechaInicio(),
        fecha_fin: getFechaFin(),
      });
      setResultado(data);
    } catch (err) {
      setResultado({
        disponible: false,
        razon: err.response?.data?.error || 'Error al conectar con el servidor.',
      });
    } finally {
      setCargando(false);
    }
  };

  const handleReservar = () => {
    onClose();
    navigate(
      `/reservaciones/nueva?espacio=${espacio.id}&fecha=${form.fecha}&hi=${form.hora_inicio}&hf=${form.hora_fin}`
    );
  };

  // ── Estilos compartidos ────────────────────────────────────
  const inputStyle = {
    width: '100%', padding: '10px 13px',
    borderRadius: '8px', border: '1.5px solid #d1d5db',
    fontSize: '14px', color: '#111827', background: 'white',
    boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
  };
  const inputDisabled = { ...inputStyle, background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' };
  const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px', display: 'block' };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(17, 3, 42, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'white', borderRadius: '16px',
        width: '100%', maxWidth: '480px',
        boxShadow: '0 20px 48px rgba(17,3,42,0.22)',
        maxHeight: '90vh', overflowY: 'auto',
        fontFamily: '"Inter", sans-serif',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 22px', borderBottom: '1px solid #f3f4f6',
          position: 'sticky', top: 0, background: 'white',
          borderRadius: '16px 16px 0 0', zIndex: 1,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827' }}>
              Consultar disponibilidad
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>
              Selecciona fecha y horario para verificar
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '6px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Chip del espacio */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: '#fff7ed', borderRadius: '10px',
            padding: '12px 14px', border: '1.5px solid #fed7aa',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'white', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
              border: '1px solid #fed7aa',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#111827' }}>{espacio.nombre}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>
                {[espacio.ubicacion, espacio.tipo_nombre].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>

          {/* Fecha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={labelStyle}>
              Fecha <span style={{ color: '#b91c1c' }}>*</span>
            </label>
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              min={hoy}
              style={errFecha ? { ...inputStyle, borderColor: '#f87171' } : inputStyle}
            />
            {errFecha ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {errFecha}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                Solo lunes a viernes · Horario 7:00 AM – 8:00 PM
              </p>
            )}
          </div>

          {/* Horario */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={labelStyle}>
              Horario <span style={{ color: '#b91c1c' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

              {/* Inicio */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Inicio</span>
                <select
                  name="hora_inicio"
                  value={form.hora_inicio}
                  onChange={handleChange}
                  disabled={!form.fecha || !!errFecha}
                  style={!form.fecha || errFecha ? inputDisabled : inputStyle}
                >
                  <option value="">-- Hora --</option>
                  {horasInicio.map((h) => (
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
                  value={form.hora_fin}
                  onChange={handleChange}
                  disabled={!form.hora_inicio}
                  style={!form.hora_inicio ? inputDisabled : inputStyle}
                >
                  <option value="">-- Hora --</option>
                  {horasFin.map((h) => (
                    <option key={h} value={h}>{formatHora(h)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resumen horario */}
            {resumenHorario && (
              <div style={{
                marginTop: '4px', padding: '8px 13px', borderRadius: '8px',
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                fontSize: '13px', fontWeight: '600', color: '#15803d',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {resumenHorario}
              </div>
            )}
          </div>

          {/* Error general */}
          {errorMsg && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', padding: '10px 14px',
              color: '#b91c1c', fontSize: '13px',
              display: 'flex', alignItems: 'flex-start', gap: '8px',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errorMsg}
            </div>
          )}

          {/* ── Resultado ── */}
          {resultado && (
            resultado.disponible ? (
              /* Disponible */
              <div style={{
                borderRadius: '10px', border: '1.5px solid #bbf7d0',
                background: '#f0fdf4', padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#166534' }}>
                      ¡Espacio disponible!
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#15803d' }}>
                      No hay conflictos en el horario seleccionado
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReservar}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
                    background: '#16a34a', color: 'white', fontWeight: '600', fontSize: '14px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <polyline points="9 11 12 14 15 11"/>
                  </svg>
                  Reservar este horario
                </button>
              </div>
            ) : (
              /* No disponible */
              <div style={{
                borderRadius: '10px', border: '1.5px solid #fecaca',
                background: '#fef2f2', padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#991b1b' }}>
                      No disponible
                    </p>
                    {resultado.razon && (
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#b91c1c' }}>{resultado.razon}</p>
                    )}
                  </div>
                </div>
                {resultado.conflictos && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {resultado.conflictos.reservaciones?.length > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'white', borderRadius: '8px', padding: '8px 12px',
                        border: '1px solid #fecaca', fontSize: '13px', color: '#991b1b',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {resultado.conflictos.reservaciones.length === 1
                          ? '1 reservación existente en ese horario'
                          : `${resultado.conflictos.reservaciones.length} reservaciones en ese horario`}
                      </div>
                    )}
                    {resultado.conflictos.bloqueados?.length > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'white', borderRadius: '8px', padding: '8px 12px',
                        border: '1px solid #fecaca', fontSize: '13px', color: '#991b1b',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Horario bloqueado por administración
                      </div>
                    )}
                  </div>
                )}
                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                  Prueba con otro horario o consulta un día distinto.
                </p>
              </div>
            )
          )}

          {/* ── Botón verificar ── */}
          <button
            onClick={handleVerificar}
            disabled={cargando || !formularioCompleto}
            style={{
              width: '100%', padding: '12px', borderRadius: '9px', border: 'none',
              background: !formularioCompleto ? '#f3f4f6' : cargando ? '#9b4c1a' : '#ea580c',
              color: !formularioCompleto ? '#9ca3af' : 'white',
              fontWeight: '600', fontSize: '14px',
              cursor: !formularioCompleto || cargando ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background 0.2s',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {cargando ? 'Verificando...' : 'Verificar disponibilidad'}
          </button>

        </div>
      </div>
    </div>
  );
};

export default DisponibilidadCalendario;
