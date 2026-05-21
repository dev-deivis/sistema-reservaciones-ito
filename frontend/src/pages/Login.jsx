import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const DOMINIO = '@itoaxaca.edu.mx';

const Login = () => {
  const [vista, setVista] = useState('login');
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- Estado login ---
  const [formLogin, setFormLogin] = useState({ email: '', password: '' });
  const [errorLogin, setErrorLogin] = useState('');
  const [cargandoLogin, setCargandoLogin] = useState(false);

  // --- Estado registro ---
  const [formRegistro, setFormRegistro] = useState({
    nombre: '', tipo: 'estudiante', email: '', password: '', confirmar: '',
  });
  const [errorRegistro, setErrorRegistro] = useState('');
  const [cargandoRegistro, setCargandoRegistro] = useState(false);

  const cambiarVista = (v) => {
    setVista(v);
    setErrorLogin('');
    setErrorRegistro('');
  };

  // --- Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    setCargandoLogin(true);
    try {
      const { data } = await api.post('/auth/login', formLogin);
      login(data.token, data.usuario);
      navigate('/');
    } catch (err) {
      setErrorLogin(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setCargandoLogin(false);
    }
  };

  // --- Registro ---
  const handleRegistro = async (e) => {
    e.preventDefault();
    setErrorRegistro('');

    if (!formRegistro.email.endsWith(DOMINIO)) {
      setErrorRegistro(`El correo debe terminar en ${DOMINIO}`);
      return;
    }
    if (formRegistro.password !== formRegistro.confirmar) {
      setErrorRegistro('Las contraseñas no coinciden');
      return;
    }
    if (formRegistro.password.length < 6) {
      setErrorRegistro('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargandoRegistro(true);
    try {
      await api.post('/auth/registro', {
        nombre: formRegistro.nombre,
        email: formRegistro.email,
        password: formRegistro.password,
        tipo: formRegistro.tipo,
      });
      cambiarVista('login');
      setFormLogin({ email: formRegistro.email, password: '' });
      setErrorLogin('Cuenta creada. Ya puedes iniciar sesión.');
    } catch (err) {
      setErrorRegistro(err.response?.data?.error || 'Error al crear la cuenta');
    } finally {
      setCargandoRegistro(false);
    }
  };

  return (
    <div className="login-container">
      {/* Panel izquierdo */}
      <div className="login-left">
        <div className="left-content">
          <div className="logo-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h1 className="login-title">ReservaITO</h1>
          <p className="login-subtitle">
            Sistema de Reservacion de Espacios del Instituto<br />Tecnologico de Oaxaca
          </p>
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div className="feature-text">
                <h4>Reserva espacios</h4>
                <p>Auditorios, salas y laboratorios</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="feature-text">
                <h4>Gestiona tu agenda</h4>
                <p>Consulta disponibilidad en tiempo real</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="login-right">

        {vista === 'login' ? (
          <div className="login-card">
            <div className="lock-icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2 className="welcome-title">Bienvenido</h2>
            <p className="welcome-subtitle">Ingresa tus credenciales para acceder al sistema</p>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="input-group">
                <label>Correo electronico</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="correo@itoaxaca.edu.mx"
                    value={formLogin.email}
                    onChange={(e) => setFormLogin({ ...formLogin, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Contraseña</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formLogin.password}
                    onChange={(e) => setFormLogin({ ...formLogin, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              {errorLogin && (
                <div className={`login-error ${errorLogin.includes('creada') ? 'login-success' : ''}`}>
                  {errorLogin}
                </div>
              )}

              <button className="login-button" type="submit" disabled={cargandoLogin}>
                {cargandoLogin ? 'Cargando...' : 'Iniciar sesion'}
              </button>
            </form>

            <p className="login-toggle">
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={() => cambiarVista('registro')}>
                Crear cuenta
              </button>
            </p>
          </div>

        ) : (
          <div className="login-card">
            <div className="lock-icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2 className="welcome-title">Crear cuenta</h2>
            <p className="welcome-subtitle">Solo para personal del Instituto Tecnologico de Oaxaca</p>

            <form className="login-form" onSubmit={handleRegistro}>
              <div className="input-group">
                <label>Nombre completo</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Tu nombre completo"
                    value={formRegistro.nombre}
                    onChange={(e) => setFormRegistro({ ...formRegistro, nombre: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Tipo de usuario</label>
                <div className="tipo-selector">
                  <button
                    type="button"
                    className={formRegistro.tipo === 'estudiante' ? 'tipo-btn activo' : 'tipo-btn'}
                    onClick={() => setFormRegistro({ ...formRegistro, tipo: 'estudiante' })}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                    Estudiante
                  </button>
                  <button
                    type="button"
                    className={formRegistro.tipo === 'docente' ? 'tipo-btn activo' : 'tipo-btn'}
                    onClick={() => setFormRegistro({ ...formRegistro, tipo: 'docente' })}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                    Docente
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Correo institucional</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder={`usuario${DOMINIO}`}
                    value={formRegistro.email}
                    onChange={(e) => setFormRegistro({ ...formRegistro, email: e.target.value })}
                    required
                  />
                </div>
                {formRegistro.email && !formRegistro.email.endsWith(DOMINIO) && (
                  <p className="input-hint-error">Debe terminar en {DOMINIO}</p>
                )}
              </div>

              <div className="input-group">
                <label>Contraseña</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formRegistro.password}
                    onChange={(e) => setFormRegistro({ ...formRegistro, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Confirmar contraseña</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={formRegistro.confirmar}
                    onChange={(e) => setFormRegistro({ ...formRegistro, confirmar: e.target.value })}
                    required
                  />
                </div>
                {formRegistro.confirmar && formRegistro.password !== formRegistro.confirmar && (
                  <p className="input-hint-error">Las contraseñas no coinciden</p>
                )}
              </div>

              {errorRegistro && <div className="login-error">{errorRegistro}</div>}

              <button className="login-button" type="submit" disabled={cargandoRegistro}>
                {cargandoRegistro ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <p className="login-toggle">
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={() => cambiarVista('login')}>
                Iniciar sesion
              </button>
            </p>
          </div>
        )}

        <div className="login-footer">
          <p>Tecnologico Nacional de Mexico<br />2026 Instituto Tecnologico de Oaxaca</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
