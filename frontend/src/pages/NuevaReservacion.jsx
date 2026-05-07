import { useNavigate } from "react-router-dom";
import FormularioReservacion from "../components/FormularioReservacion";

export default function NuevaReservacion() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/reservaciones");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>Nueva Reservación</h1>
        <p style={styles.subtitulo}>
          Completa el formulario para reservar un espacio institucional.
        </p>
        <FormularioReservacion onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "40px 16px",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "32px",
    width: "100%",
    maxWidth: "560px",
  },
  titulo: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 8px 0",
  },
  subtitulo: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 24px 0",
  },
};