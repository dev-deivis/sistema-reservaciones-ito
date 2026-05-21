import { useNavigate } from "react-router-dom";
import FormularioReservacion from "../components/FormularioReservacion";

export default function NuevaReservacion() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "32px 36px", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0" }}>
          Nueva Reservación
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
          Completa el formulario para reservar un espacio
        </p>
      </div>
      <FormularioReservacion onSuccess={() => navigate("/reservaciones")} />
    </div>
  );
}