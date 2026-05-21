import { useState, useEffect } from "react";
import api from "../api/axios";

const IconCalendario = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconCalBtn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px", flexShrink: 0}}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px", flexShrink: 0}}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function FormularioReservacion({ onSuccess }) {
  const [espacios, setEspacios] = useState([]);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [form, setForm] = useState({
    espacio_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    motivo: "",
  });
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/espacios").then((res) => setEspacios(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setDisponibilidad(null);
    if (name === "espacio_id") {
      const esp = espacios.find((es) => String(es.id) === String(value));
      setEspacioSeleccionado(esp || null);
    }
  };

  const verificarDisponibilidad = async () => {
    setError("");
    if (!form.espacio_id || !form.fecha_inicio || !form.fecha_fin) {
      setError("Selecciona el espacio y las fechas antes de verificar.");
      return;
    }
    setVerificando(true);
    try {
      const res = await api.post("/disponibilidad/verificar", {
        espacioId: form.espacio_id,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
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
      setError(err.response?.data?.error || "Error al crear la reservación.");
    } finally {
      setEnviando(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "8px",
    border: "1.5px solid #d1d5db",
    fontSize: "14px",
    color: "#111827",
    background: "white",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px", alignItems: "start" }}>

      {/* ── Columna izquierda: formulario ── */}
      <div style={{ background: "white", borderRadius: "14px", border: "1.5px solid #e5e7eb", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Espacio */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            Espacio <span style={{ color: "#b91c1c" }}>*</span>
          </label>
          <select name="espacio_id" value={form.espacio_id} onChange={handleChange} style={inputStyle}>
            <option value="">Selecciona un espacio</option>
            {espacios.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </div>

        {/* Fecha inicio */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            Fecha y hora de inicio <span style={{ color: "#b91c1c" }}>*</span>
          </label>
          <input type="datetime-local" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} style={inputStyle} />
        </div>

        {/* Fecha fin */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            Fecha y hora de fin <span style={{ color: "#b91c1c" }}>*</span>
          </label>
          <input type="datetime-local" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} style={inputStyle} />
        </div>

        {/* Motivo */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            Motivo de la reservacion <span style={{ fontSize: "13px", fontWeight: "400", color: "#6b7280" }}>(opcional)</span>
          </label>
          <textarea
            name="motivo"
            value={form.motivo}
            onChange={handleChange}
            rows={4}
            placeholder="Describe el proposito de la reservacion..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Mensajes de disponibilidad */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", color: "#b91c1c", fontSize: "14px" }}>
            {error}
          </div>
        )}
        {disponibilidad === true && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 14px", color: "#15803d", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            El espacio está disponible en ese horario.
          </div>
        )}
        {disponibilidad === false && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", color: "#b91c1c", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            El espacio no está disponible en ese horario.
          </div>
        )}

        {/* Botón verificar */}
        <button
          onClick={verificarDisponibilidad}
          disabled={verificando}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "14px", borderRadius: "9px", border: "none",
            background: verificando ? "#9b2020" : "#b91c1c",
            color: "white", fontWeight: "600", cursor: verificando ? "not-allowed" : "pointer",
            fontSize: "15px", width: "100%", transition: "background 0.2s",
          }}
        >
          <IconCalBtn />
          {verificando ? "Verificando..." : "Verificar disponibilidad"}
        </button>

        {/* Botón confirmar */}
        {disponibilidad === true && (
          <button
            onClick={handleSubmit}
            disabled={enviando}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "14px", borderRadius: "9px", border: "none",
              background: enviando ? "#166534" : "#16a34a",
              color: "white", fontWeight: "600", cursor: enviando ? "not-allowed" : "pointer",
              fontSize: "15px", width: "100%", transition: "background 0.2s",
            }}
          >
            <IconCheck />
            {enviando ? "Confirmando..." : "Confirmar reservación"}
          </button>
        )}
      </div>

      {/* ── Columna derecha ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Panel detalle espacio */}
        <div style={{
          background: "#f9fafb", borderRadius: "14px", border: "1.5px solid #e5e7eb",
          padding: "28px", minHeight: "170px", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          {espacioSeleccionado ? (
            <div style={{ width: "100%", alignSelf: "flex-start" }}>
              <p style={{ fontWeight: "700", fontSize: "16px", color: "#111827", margin: "0 0 10px 0" }}>
                {espacioSeleccionado.nombre}
              </p>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 4px 0" }}>
                Tipo: {espacioSeleccionado.tipo_nombre}
              </p>
              {espacioSeleccionado.capacidad && (
                <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 4px 0" }}>
                  Capacidad: {espacioSeleccionado.capacidad} personas
                </p>
              )}
              {espacioSeleccionado.descripcion && (
                <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>
                  {espacioSeleccionado.descripcion}
                </p>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#9ca3af" }}>
              <IconCalendario />
              <p style={{ fontSize: "14px", margin: "12px 0 0 0" }}>
                Selecciona un espacio para ver sus detalles
              </p>
            </div>
          )}
        </div>

        {/* Panel instrucciones */}
        <div style={{ background: "white", borderRadius: "14px", border: "1.5px solid #e5e7eb", padding: "24px" }}>
          <p style={{ fontWeight: "700", fontSize: "16px", color: "#111827", margin: "0 0 16px 0" }}>
            Instrucciones
          </p>
          {[
            "Selecciona el espacio que deseas reservar",
            "Indica la fecha y hora de inicio y fin",
            "Verifica la disponibilidad del espacio",
            "Confirma tu reservacion",
          ].map((texto, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: i < 3 ? "12px" : "0" }}>
              <div style={{
                background: "#fee2e2", color: "#b91c1c",
                borderRadius: "50%", width: "26px", height: "26px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "700", flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: "14px", color: "#374151" }}>{texto}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}