import React, { useEffect, useState } from 'react';
import api from '../api/axios';

// ── Íconos ──────────────────────────────────────────────
const IconPersona = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);
const IconToggleOn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
    <circle cx="16" cy="12" r="3" fill="currentColor"/>
  </svg>
);
const IconToggleOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
    <circle cx="8" cy="12" r="3" fill="currentColor"/>
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconAlerta = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// ── Estilos reutilizables ────────────────────────────────
const styles = {
  container: {
    padding: '32px',
    maxWidth: '1100px',
    margin: '0 auto',
    fontFamily: '"Inter", sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
  },
  titulo: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#11032a',
    margin: 0,
  },
  btnPrimario: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#d92a00',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '10px 20px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  filtros: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  inputBuscar: {
    flex: 1,
    minWidth: '220px',
    padding: '10px 14px 10px 38px',
    border: '1px solid #e0dce8',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    background: 'white',
  },
  select: {
    padding: '10px 14px',
    border: '1px solid #e0dce8',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    background: 'white',
    cursor: 'pointer',
  },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(17, 3, 42, 0.06)',
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    background: '#f4f2f8',
    color: '#6b5f82',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid #e8e4f0',
  },
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid #f0edf6',
    fontSize: '14px',
    color: '#2d1f47',
    verticalAlign: 'middle',
  },
  badge: (tipo) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    ...(tipo === 'admin'
      ? { background: 'rgba(217,42,0,0.1)', color: '#d92a00', border: '1px solid rgba(217,42,0,0.25)' }
      : tipo === 'activo'
      ? { background: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.25)' }
      : tipo === 'docente'
      ? { background: 'rgba(37,99,235,0.1)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.25)' }
      : tipo === 'estudiante'
      ? { background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.25)' }
      : { background: 'rgba(107,114,128,0.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.25)' }),
  }),
  btnIcono: (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    background: color === 'rojo' ? 'rgba(217,42,0,0.08)'
      : color === 'verde' ? 'rgba(22,163,74,0.08)'
      : 'rgba(107,114,128,0.08)',
    color: color === 'rojo' ? '#d92a00'
      : color === 'verde' ? '#16a34a'
      : '#6b7280',
    transition: 'background 0.2s',
  }),
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(17, 3, 42, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 16px 48px rgba(17,3,42,0.22)',
  },
  modalTitulo: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#11032a',
    margin: '0 0 24px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b5f82',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e0dce8',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  modalBtns: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
  },
  btnCancelar: {
    padding: '10px 20px',
    border: '1px solid #e0dce8',
    borderRadius: '10px',
    background: 'white',
    color: '#6b5f82',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

// ── Componente principal ─────────────────────────────────
const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [modalCrear, setModalCrear] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', email: '', password: '', rol: 'usuario' });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [errorEditar, setErrorEditar] = useState('');
  const [confirmacion, setConfirmacion] = useState(null);
  const [toast, setToast] = useState(null);
  const [modalPassword, setModalPassword] = useState(null);
  const [formPassword, setFormPassword] = useState({ password_nueva: '', confirmar: '' });
  const [errorPassword, setErrorPassword] = useState('');
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  const mostrarToast = (tipo, mensaje) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 3500);
  };

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const params = {};
      if (buscar) params.buscar = buscar;
      if (filtroRol) params.rol = filtroRol;
      if (filtroActivo !== '') params.activo = filtroActivo;
      const res = await api.get('/usuarios', { params });
      setUsuarios(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, [buscar, filtroRol, filtroActivo]);

  const handleToggleActivo = async (usuario) => {
    try {
      const res = await api.patch(`/usuarios/${usuario.id}/activo`);
      setUsuarios(prev => prev.map(u => u.id === usuario.id ? { ...u, activo: res.data.activo } : u));
      mostrarToast('exito', `Cuenta ${res.data.activo ? 'activada' : 'desactivada'} correctamente`);
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al cambiar estado');
    }
  };

  const handleCambiarRol = (usuario) => {
    const nuevoRol = usuario.rol === 'admin' ? 'usuario' : 'admin';
    setConfirmacion({
      titulo: 'Cambiar rol',
      mensaje: `¿Cambiar el rol de "${usuario.nombre}" a ${nuevoRol === 'admin' ? 'Administrador' : 'Usuario'}?`,
      onConfirmar: async () => {
        try {
          const res = await api.put(`/usuarios/${usuario.id}`, { rol: nuevoRol });
          setUsuarios(prev => prev.map(u => u.id === usuario.id ? { ...u, rol: res.data.rol } : u));
          mostrarToast('exito', 'Rol actualizado correctamente');
        } catch (err) {
          mostrarToast('error', err.response?.data?.error || 'Error al cambiar rol');
        }
      },
    });
  };

  const handleEliminar = (usuario) => {
    setConfirmacion({
      titulo: 'Eliminar usuario',
      mensaje: `¿Eliminar a "${usuario.nombre}"? Esta acción no se puede deshacer.`,
      variante: 'peligro',
      onConfirmar: async () => {
        try {
          await api.delete(`/usuarios/${usuario.id}`);
          setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
          mostrarToast('exito', 'Usuario eliminado correctamente');
        } catch (err) {
          mostrarToast('error', err.response?.data?.error || 'Error al eliminar usuario');
        }
      },
    });
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorEditar('');
    try {
      const { id, nombre, email, rol, tipo } = usuarioEditando;
      const res = await api.put(`/usuarios/${id}`, { nombre, email, rol, tipo });
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ...res.data } : u));
      setUsuarioEditando(null);
    } catch (err) {
      setErrorEditar(err.response?.data?.error || 'Error al actualizar usuario');
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarPassword = async (e) => {
    e.preventDefault();
    setErrorPassword('');
    if (formPassword.password_nueva.length < 8) {
      setErrorPassword('La nueva contraseña debe tener mínimo 8 caracteres');
      return;
    }
    if (formPassword.password_nueva !== formPassword.confirmar) {
      setErrorPassword('Las contraseñas no coinciden');
      return;
    }
    setGuardandoPassword(true);
    try {
      await api.patch(`/usuarios/${modalPassword.id}/password`, {
        password_nueva: formPassword.password_nueva,
      });
      setModalPassword(null);
      setFormPassword({ password_nueva: '', confirmar: '' });
      mostrarToast('exito', 'Contraseña actualizada correctamente');
    } catch (err) {
      setErrorPassword(err.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setGuardandoPassword(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const res = await api.post('/usuarios', nuevoUsuario);
      setUsuarios(prev => [res.data, ...prev]);
      setModalCrear(false);
      setNuevoUsuario({ nombre: '', email: '', password: '', rol: 'usuario' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear usuario');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Encabezado */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(217,42,0,0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#d92a00',
          }}>
            <IconPersona />
          </div>
          <div>
            <h1 style={styles.titulo}>Gestión de Usuarios</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#9c94b3' }}>
              {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} encontrado{usuarios.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button style={styles.btnPrimario} onClick={() => setModalCrear(true)}>
          <IconPlus /> Nuevo usuario
        </button>
      </div>

      {/* Filtros */}
      <div style={styles.filtros}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9c94b3' }}>
            <IconSearch />
          </span>
          <input
            style={styles.inputBuscar}
            placeholder="Buscar por nombre o email..."
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
          />
        </div>
        <select style={styles.select} value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="usuario">Usuario</option>
        </select>
        <select style={styles.select} value={filtroActivo} onChange={e => setFiltroActivo(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      {/* Tabla */}
      {cargando ? (
        <p style={{ textAlign: 'center', color: '#9c94b3', padding: '40px' }}>Cargando usuarios...</p>
      ) : (
        <table style={styles.tabla}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Rol</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Registro</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#9c94b3', padding: '32px' }}>
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              usuarios.map(u => (
                <tr key={u.id} style={{ transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#faf9fc'}
                  onMouseOut={e => e.currentTarget.style.background = ''}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: u.rol === 'admin' ? '#d92a00' : '#7c3aed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0,
                      }}>
                        {u.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <span style={{ fontWeight: '600' }}>{u.nombre}</span>
                    </div>
                  </td>
                  <td style={{ ...styles.td, color: '#6b5f82' }}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(u.rol === 'admin' ? 'admin' : 'usuario')}>
                      {u.rol === 'admin' && <IconShield />}
                      {u.rol === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.badge(u.tipo || 'estudiante')}>
                      {u.tipo === 'docente' ? 'Docente' : 'Estudiante'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.badge(u.activo ? 'activo' : 'inactivo')}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, color: '#9c94b3', fontSize: '13px' }}>
                    {new Date(u.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {/* Editar */}
                      <button
                        title="Editar usuario"
                        style={styles.btnIcono('gris')}
                        onClick={() => { setUsuarioEditando({ ...u }); setErrorEditar(''); }}
                      >
                        <IconEdit />
                      </button>

                      {/* Toggle activo */}
                      <button
                        title={u.activo ? 'Desactivar cuenta' : 'Activar cuenta'}
                        style={styles.btnIcono(u.activo ? 'verde' : 'gris')}
                        onClick={() => handleToggleActivo(u)}
                      >
                        {u.activo ? <IconToggleOn /> : <IconToggleOff />}
                      </button>

                      {/* Cambiar rol */}
                      <button
                        title={`Cambiar a ${u.rol === 'admin' ? 'usuario' : 'admin'}`}
                        style={styles.btnIcono(u.rol === 'admin' ? 'rojo' : 'gris')}
                        onClick={() => handleCambiarRol(u)}
                      >
                        <IconShield />
                      </button>

                      {/* Cambiar contraseña */}
                      <button
                        title="Cambiar contraseña"
                        style={styles.btnIcono('gris')}
                        onClick={() => {
                          setModalPassword({ id: u.id, nombre: u.nombre });
                          setFormPassword({ password_nueva: '', confirmar: '' });
                          setErrorPassword('');
                        }}
                      >
                        <IconLock />
                      </button>

                      {/* Eliminar */}
                      <button
                        title="Eliminar usuario"
                        style={styles.btnIcono('rojo')}
                        onClick={() => handleEliminar(u)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: toast.tipo === 'exito' ? '#16a34a' : '#d92a00',
          color: 'white', borderRadius: '12px', padding: '13px 22px',
          fontSize: '14px', fontWeight: '600',
          boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
          zIndex: 3000, display: 'flex', alignItems: 'center', gap: '10px',
          whiteSpace: 'nowrap',
        }}>
          {toast.tipo === 'exito' ? <IconCheck /> : <IconAlerta />}
          {toast.mensaje}
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmacion && (
        <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) setConfirmacion(null); }}>
          <div style={{ ...styles.modal, maxWidth: '420px' }}>
            <h2 style={{ ...styles.modalTitulo, fontSize: '18px', marginBottom: '12px' }}>
              {confirmacion.titulo}
            </h2>
            <p style={{ color: '#4b3f6b', fontSize: '14px', margin: '0 0 28px', lineHeight: '1.6' }}>
              {confirmacion.mensaje}
            </p>
            <div style={styles.modalBtns}>
              <button style={styles.btnCancelar} onClick={() => setConfirmacion(null)}>
                Cancelar
              </button>
              <button
                style={{
                  ...styles.btnPrimario,
                  background: confirmacion.variante === 'peligro' ? '#d92a00' : '#11032a',
                }}
                onClick={() => {
                  confirmacion.onConfirmar();
                  setConfirmacion(null);
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar usuario */}
      {usuarioEditando && (
        <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) setUsuarioEditando(null); }}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={styles.modalTitulo}>Editar usuario</h2>
              <button
                onClick={() => setUsuarioEditando(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9c94b3' }}
              >
                <IconX />
              </button>
            </div>

            {errorEditar && (
              <div style={{
                background: 'rgba(217,42,0,0.08)', border: '1px solid rgba(217,42,0,0.2)',
                borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
                color: '#d92a00', fontSize: '13px',
              }}>
                {errorEditar}
              </div>
            )}

            <form onSubmit={handleGuardarEdicion}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre completo</label>
                <input
                  style={styles.input}
                  required
                  value={usuarioEditando.nombre}
                  onChange={e => setUsuarioEditando(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej. María López Hernández"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Correo electrónico</label>
                <input
                  style={styles.input}
                  type="email"
                  required
                  value={usuarioEditando.email}
                  onChange={e => setUsuarioEditando(p => ({ ...p, email: e.target.value }))}
                  placeholder="usuario@itoaxaca.edu.mx"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Rol</label>
                <select
                  style={{ ...styles.input, cursor: 'pointer' }}
                  value={usuarioEditando.rol}
                  onChange={e => setUsuarioEditando(p => ({ ...p, rol: e.target.value }))}
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo</label>
                <select
                  style={{ ...styles.input, cursor: 'pointer' }}
                  value={usuarioEditando.tipo || 'estudiante'}
                  onChange={e => setUsuarioEditando(p => ({ ...p, tipo: e.target.value }))}
                >
                  <option value="estudiante">Estudiante</option>
                  <option value="docente">Docente</option>
                </select>
              </div>

              <div style={styles.modalBtns}>
                <button type="button" style={styles.btnCancelar} onClick={() => setUsuarioEditando(null)}>
                  Cancelar
                </button>
                <button type="submit" style={{ ...styles.btnPrimario, opacity: guardando ? 0.7 : 1 }} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal cambiar contraseña */}
      {modalPassword && (
        <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) setModalPassword(null); }}>
          <div style={{ ...styles.modal, maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={styles.modalTitulo}>Cambiar contraseña</h2>
              <button
                onClick={() => setModalPassword(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9c94b3' }}
              >
                <IconX />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#6b5f82', margin: '0 0 20px' }}>
              Establecer nueva contraseña para <strong>{modalPassword.nombre}</strong>.
            </p>

            {errorPassword && (
              <div style={{
                background: 'rgba(217,42,0,0.08)', border: '1px solid rgba(217,42,0,0.2)',
                borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
                color: '#d92a00', fontSize: '13px',
              }}>
                {errorPassword}
              </div>
            )}

            <form onSubmit={handleGuardarPassword}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nueva contraseña</label>
                <input
                  style={styles.input}
                  type="password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  value={formPassword.password_nueva}
                  onChange={e => setFormPassword(p => ({ ...p, password_nueva: e.target.value }))}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Confirmar contraseña</label>
                <input
                  style={styles.input}
                  type="password"
                  required
                  placeholder="Repite la nueva contraseña"
                  value={formPassword.confirmar}
                  onChange={e => setFormPassword(p => ({ ...p, confirmar: e.target.value }))}
                />
              </div>

              <div style={styles.modalBtns}>
                <button type="button" style={styles.btnCancelar} onClick={() => setModalPassword(null)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ ...styles.btnPrimario, opacity: guardandoPassword ? 0.7 : 1 }}
                  disabled={guardandoPassword}
                >
                  {guardandoPassword ? 'Guardando...' : 'Guardar contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal crear usuario */}
      {modalCrear && (
        <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) setModalCrear(false); }}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={styles.modalTitulo}>Nuevo usuario</h2>
              <button
                onClick={() => setModalCrear(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9c94b3' }}
              >
                <IconX />
              </button>
            </div>

            {error && (
              <div style={{
                background: 'rgba(217,42,0,0.08)', border: '1px solid rgba(217,42,0,0.2)',
                borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
                color: '#d92a00', fontSize: '13px',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCrear}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre completo</label>
                <input
                  style={styles.input}
                  required
                  value={nuevoUsuario.nombre}
                  onChange={e => setNuevoUsuario(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej. María López Hernández"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Correo electrónico</label>
                <input
                  style={styles.input}
                  type="email"
                  required
                  value={nuevoUsuario.email}
                  onChange={e => setNuevoUsuario(p => ({ ...p, email: e.target.value }))}
                  placeholder="usuario@itoaxaca.edu.mx"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contraseña</label>
                <input
                  style={styles.input}
                  type="password"
                  required
                  minLength={6}
                  value={nuevoUsuario.password}
                  onChange={e => setNuevoUsuario(p => ({ ...p, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Rol</label>
                <select
                  style={{ ...styles.input, cursor: 'pointer' }}
                  value={nuevoUsuario.rol}
                  onChange={e => setNuevoUsuario(p => ({ ...p, rol: e.target.value }))}
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div style={styles.modalBtns}>
                <button type="button" style={styles.btnCancelar} onClick={() => setModalCrear(false)}>
                  Cancelar
                </button>
                <button type="submit" style={{ ...styles.btnPrimario, opacity: guardando ? 0.7 : 1 }} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;
