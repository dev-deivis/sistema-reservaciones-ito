import React from 'react';

const FiltroEspacios = ({ tipos, onFilterChange }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="Buscar por nombre..." 
          onChange={(e) => onFilterChange('busqueda', e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.6rem 0.6rem 2.5rem',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '0.95rem',
            outline: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <select 
          onChange={(e) => onFilterChange('tipo', e.target.value)}
          style={{
            padding: '0.6rem 2rem 0.6rem 1rem',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: 'white',
            fontSize: '0.95rem',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.7rem center',
            backgroundSize: '1rem'
          }}
        >
          <option value="">Todos los tipos</option>
          {tipos.map((tipo, idx) => (
            <option key={idx} value={tipo}>{tipo}</option>
          ))}
        </select>

        <select 
          onChange={(e) => onFilterChange('estado', e.target.value)}
          style={{
            padding: '0.6rem 2rem 0.6rem 1rem',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: 'white',
            fontSize: '0.95rem',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.7rem center',
            backgroundSize: '1rem'
          }}
        >
          <option value="">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="en_mantenimiento">En Mantenimiento</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>
    </div>
  );
};

export default FiltroEspacios;
