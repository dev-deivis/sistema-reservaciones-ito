import { useNavigate } from "react-router-dom";
import FormularioReservacion from "../components/FormularioReservacion";
import useWindowSize from "../hooks/useWindowSize";

export default function NuevaReservacion() {
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  return (
    <div style={{ padding: isMobile ? '16px' : '32px 36px', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
          Nueva Reservación
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Completa el formulario para reservar un espacio
        </p>
      </div>
      <FormularioReservacion onSuccess={() => navigate("/reservaciones")} />
    </div>
  );
}
