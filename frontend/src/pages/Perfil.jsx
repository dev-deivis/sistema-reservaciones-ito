import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d92a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid #e0dce8',
  borderRadius: '10px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

export default function Perfil() {
  const { usuario } = useAuth();
  const [form, setForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (form.nueva.length < 8) {
      setError('La nueva contraseña debe tener mínimo 8 caracteres');
      return;
    }
    if (form.nueva !== form.confirmar) {
      setError('La nueva contraseña y la confirmación no coinciden');
      return;
    }

    setEnviando(true);
    try {
      await api.patch(`/usuarios/${usuario.id}/password`, {
        password_actual: form.actual,
        password_nueva: form.nueva,
      });
      setExito('Contraseña actualizada correctamente');
      setForm({ actual: '', nueva: '', confirmar: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '640px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>

      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: 'rgba(217,42,0,0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#d92a00',
        }}>
          <IconUser />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#11032a' }}>Mi perfil</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#9c94b3', marginTop: '2px' }}>Información de tu cuenta</p>
        </div>
      </div>

      {/* Tarjeta de información */}
      <div style={{
        background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb',
        padding: '28px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '20px',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: '#d92a00',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '800', fontSize: '22px', flexShrink: 0,
          boxShadow: '0 4px 14px rgba(217,42,0,0.3)',
        }}>
          {iniciales}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700', color: '#11032a' }}>
            {usuario?.nombre}
          </p>
          <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#6b5f82' }}>
            {usuario?.email}
          </p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: usuario?.rol === 'admin' ? 'rgba(217,42,0,0.1)' : 'rgba(124,58,237,0.1)',
            color: usuario?.rol === 'admin' ? '#d92a00' : '#7c3aed',
            border: `1px solid ${usuario?.rol === 'admin' ? 'rgba(217,42,0,0.25)' : 'rgba(124,58,237,0.25)'}`,
            borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: '600',
          }}>
            <IconShield />
            {usuario?.rol === 'admin' ? 'Administrador' : 'Usuario'}
          </span>
        </div>
      </div>

      {/* Formulario cambio de contraseña */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', background: '#ede9fe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconLock />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '16px', color: '#11032a' }}>Cambiar contraseña</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9c94b3' }}>Mínimo 8 caracteres</p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '11px 14px', marginBottom: '18px', color: '#b91c1c', fontSize: '13px' }}>
            {error}
          </div>
        )}
        {exito && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '11px 14px', marginBottom: '18px', color: '#15803d', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconCheck /> {exito}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { field: 'actual', label: 'Contraseña actual', placeholder: 'Tu contraseña actual' },
            { field: 'nueva', label: 'Nueva contraseña', placeholder: 'Mínimo 8 caracteres' },
            { field: 'confirmar', label: 'Confirmar nueva contraseña', placeholder: 'Repite la nueva contraseña' },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6b5f82', marginBottom: '6px' }}>
                {label}
              </label>
              <input
                type="password"
                required
                placeholder={placeholder}
                value={form[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                style={inputStyle}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={enviando}
            style={{
              padding: '12px', borderRadius: '10px', border: 'none',
              background: enviando ? '#5b21b6' : '#7c3aed',
              color: 'white', fontWeight: '600', fontSize: '15px',
              cursor: enviando ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s', marginTop: '4px',
            }}
          >
            {enviando ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
