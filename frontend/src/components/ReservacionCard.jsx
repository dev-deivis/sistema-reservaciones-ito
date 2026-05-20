import { useAuth } from '../context/AuthContext';

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

const ReservacionCard = ({ reservacion, onCancelar }) => {
  const { usuario } = useAuth();
  const r = reservacion;
  const badge = badges[r.estado] || badges.pendiente;

  const puedeCanc = (r.estado === 'pendiente' || r.estado === 'confirmada') &&
    (usuario?.rol === 'admin' || usuario?.id === r.usuario_id);

  const fechaInicio = new Date(r.fecha_inicio).toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const fechaFin = new Date(r.fecha_fin).toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
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

      {/* Botón cancelar */}
      {puedeCanc && (
        <button
          onClick={() => onCancelar(r.id)}
          style={{
            padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #c0392b',
            background: 'white', color: '#c0392b', fontWeight: '600',
            fontSize: '13px', cursor: 'pointer', flexShrink: 0,
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  );
};

export default ReservacionCard;