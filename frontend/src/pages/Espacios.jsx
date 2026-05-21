import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import FiltroEspacios from '../components/FiltroEspacios';
import EspacioCard from '../components/EspacioCard';

const Espacios = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [espacios, setEspacios] = useState([]);
  const [tiposEspacio, setTiposEspacio] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: '',
    estado: ''
  });

  useEffect(() => {
    Promise.all([
      api.get('/espacios'),
      api.get('/espacios/tipos'),
    ]).then(([resE, resT]) => {
      setEspacios(resE.data);
      setTiposEspacio(resT.data.map(t => t.nombre));
    }).finally(() => setCargando(false));
  }, []);

  const handleFilterChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const handleReservar = (espacio) => {
    navigate(`/reservaciones/nueva?espacio=${espacio.id}`);
  };

  const handleEliminar = (id) => {
    setEspacios(prev => prev.filter(e => e.id !== id));
  };

  // Aplicar filtros
  const espaciosFiltrados = espacios.filter(e => {
    const matchBusqueda = e.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      e.ubicacion?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const matchTipo = filtros.tipo === '' || e.tipo_nombre === filtros.tipo;
    const matchEstado = filtros.estado === '' || e.estado === filtros.estado;
    return matchBusqueda && matchTipo && matchEstado;
  });

  if (cargando) return <p style={{ padding: '2rem' }}>Cargando espacios...</p>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#111827' }}>Espacios disponibles</h2>
          <p style={{ color: '#6b7280', margin: '0.2rem 0 1.5rem 0' }}>Explora y reserva los espacios del Instituto</p>
        </div>

      </div>

      <FiltroEspacios
        tipos={tiposEspacio}
        onFilterChange={handleFilterChange}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {espaciosFiltrados.map((e) => (
          <EspacioCard key={e.id} espacio={e} onReservar={handleReservar} onEliminar={handleEliminar} />
        ))}
      </div>

      {espaciosFiltrados.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem auto', display: 'block' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>No se encontraron espacios que coincidan con los filtros.</p>
        </div>
      )}
    </div>
  );
};

export default Espacios;
