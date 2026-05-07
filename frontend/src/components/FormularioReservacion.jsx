import { useState, useEffect } from "react";
import api from "../api/axios";

export default function FormularioReservacion({ onSuccess }) {
  const [espacios, setEspacios] = useState([]);
  const [form, setForm] = useState({
    espacio_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    motivo: "",
  });
  const [disponibilidad, setDisponibilidad] = useState(null); // null | true | false
  const [verificando, setVerificando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/espacios").then((res) => setEspacios(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setDisponibilidad(null); // reset al cambiar algo
  };

  const verificarDisponibilidad = async () => {
    setError("");
    if (!form.espacio_id || !form.fecha_inicio || !form.fecha_fin) {
      setError("Selecciona el espacio y las fechas antes de verificar.");
      return;
    }
    setVerificando(true);
    try {
      const res = await api.get("/disponibilidad/espacio", {
        params: {
          espacio_id: form.espacio_id,
          fecha_inicio: form.fecha_inicio,
          fecha_fin: form.fecha_fin,
        },
      });
      setDisponibilidad(res.data.disponible);
    } catch {
      setError("Error al verificar disponibilidad.");
    } finally {
      setVerificando(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setEnviando(true);
    try {
      await api.post("/reservaciones", form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al crear la reservación.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.field}>
        <label style={styles.label}>Espacio</label>
        <select
          name="espacio_id"
          value={form.espacio_id}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="">-- Selecciona un espacio --</option>
          {espacios.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre} — {e.tipo}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Fecha y hora de inicio</label>
        <input
          type="datetime-local"
          name="fecha_inicio"
          value={form.fecha_inicio}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Fecha y hora de fin</label>
        <input
          type="datetime-local"
          name="fecha_fin"
          value={form.fecha_fin}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Motivo (opcional)</label>
        <textarea
          name="motivo"
          value={form.motivo}
          onChange={handleChange}
          rows={3}
          placeholder="Describe el motivo de la reservación..."
          style={{ ...styles.input, resize: "vertical" }}
        />
      </div>

      {error && <p style={styles.errorMsg}>{error}</p>}

      {disponibilidad === true && (
        <p style={styles.disponible}>✅ El espacio está disponible en ese horario.</p>
      )}
      {disponibilidad === false && (
        <p style={styles.noDisponible}>❌ El espacio no está disponible en ese horario.</p>
      )}

      <button
        onClick={verificarDisponibilidad}
        disabled={verificando}
        style={styles.btnSecundario}
      >
        {verificando ? "Verificando..." : "Verificar disponibilidad"}
      </button>

      {disponibilidad === true && (
        <button
          onClick={handleSubmit}
          disabled={enviando}
          style={styles.btnPrimario}
        >
          {enviando ? "Confirmando..." : "Confirmar reservación"}
        </button>
      )}
    </div>
  );
}

const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  errorMsg: {
    color: "#dc2626",
    fontSize: "14px",
    margin: 0,
  },
  disponible: {
    color: "#16a34a",
    fontSize: "14px",
    fontWeight: "600",
    margin: 0,
  },
  noDisponible: {
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: "600",
    margin: 0,
  },
  btnSecundario: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "2px solid #3b82f6",
    background: "white",
    color: "#3b82f6",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  btnPrimario: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
};