import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh',
      fontFamily: '"Inter", sans-serif', textAlign: 'center', padding: '32px',
    }}>
      <div style={{ fontSize: '80px', fontWeight: '800', color: '#e5e7eb', lineHeight: 1, marginBottom: '16px' }}>
        404
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#11032a', margin: '0 0 8px' }}>
        Página no encontrada
      </h1>
      <p style={{ fontSize: '15px', color: '#6b5f82', margin: '0 0 32px' }}>
        La página que buscas no existe o fue movida.
      </p>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <button style={{
          padding: '12px 24px', borderRadius: '10px', border: 'none',
          background: '#d92a00', color: 'white', fontWeight: '600',
          fontSize: '15px', cursor: 'pointer',
        }}>
          Volver al inicio
        </button>
      </Link>
    </div>
  );
}
