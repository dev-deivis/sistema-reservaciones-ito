import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";

// Slots de media hora de 7:00 a 20:00
const HORAS = [];
for (let h = 7; h <= 20; h++) {
  HORAS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 20) HORAS.push(`${String(h).padStart(2, "0")}:30`);
}

const formatHora = (h) => {
  const [hh, mm] = h.split(":").map(Number);
  const periodo = hh < 12 ? "AM" : "PM";
  const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${h12}:${String(mm).padStart(2, "0")} ${periodo}`;
};

const validarHorario = (fechaInicioStr, fechaFinStr) => {
  const inicio = new Date(fechaInicioStr);
  const fin = new Date(fechaFinStr);

  const dia = inicio.getDay();
  if (dia === 0 || dia === 6) {
    return "Solo se pueden hacer reservaciones de lunes a viernes";
  }

  const horaInicio = inicio.getHours();
  if (horaInicio < 7 || horaInicio >= 20) {
    return "Las reservaciones solo pueden ser entre 7:00 AM y 8:00 PM";
  }

  const horaFin = fin.getHours();
  if (horaFin > 20) {
    return "La reservación no puede terminar después de las 8:00 PM";
  }

  const diffMinutos = (fin - inicio) / (1000 * 60);
  if (diffMinutos < 30) {
    return "La reservación debe tener una duración mínima de 30 minutos";
  }
  if (diffMinutos > 480) {
    return "La reservación no puede durar más de 8 horas";
  }

  if (inicio <= new Date()) {
    return "No puedes hacer una reservación en una fecha u hora que ya pasó";
  }

  return null;
};

const esFinDeSemana = (fechaStr) => {
  if (!fechaStr) return false;
  const [y, m, d] = fechaStr.split("-").map(Number);
  const dia = new Date(y, m - 1, d).getDay();
  return dia === 0 || dia === 6;
};

const hoy = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
})();

// ── Íconos ──────────────────────────────────────────────
const IconCalendario = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconCalBtn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px", flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px", flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function FormularioReservacion({ onSuccess }) {
  const [searchParams] = useSearchParams();
  const [espacios, setEspacios] = useState([]);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [form, setForm] = useState(() => {
    const espacioId = new URLSearchParams(window.location.search).get("espacio") || "";
    return { espacio_id: espacioId, fecha: "", hora_inicio: "", hora_fin: "", motivo: "" };
  });
  const [errFecha, setErrFecha] = useState("");
  const [errMotivo, setErrMotivo] = useState("");
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/espacios").then((res) => setEspacios(res.data));
  }, []);

  // Sincronizar espacio_id cuando cambia el query param (navegación con useNavigate)
  useEffect(() => {
    const espacioId = searchParams.get("espacio");
    if (espacioId) setForm((p) => ({ ...p, espacio_id: espacioId }));
  }, [searchParams]);

  // Sincronizar espacioSeleccionado cuando cambia espacios o espacio_id inicial
  useEffect(() => {
    if (form.espacio_id && espacios.length > 0) {
      const esp = espacios.find((e) => String(e.id) === String(form.espacio_id));
      setEspacioSeleccionado(esp || null);
    }
  }, [espacios, form.espacio_id]);

  const getFechaInicio = () =>
    form.fecha && form.hora_inicio ? `${form.fecha}T${form.hora_inicio}:00` : "";
  const getFechaFin = () =>
    form.fecha && form.hora_fin ? `${form.fecha}T${form.hora_fin}:00` : "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDisponibilidad(null);
    setError("");

    if (name === "fecha") {
      const esDS = esFinDeSemana(value);
      setErrFecha(esDS ? "Solo se permiten reservaciones de lunes a viernes." : "");
      setForm((p) => ({ ...p, fecha: value, hora_inicio: "", hora_fin: "" }));
      return;
    }

    if (name === "hora_inicio") {
      setForm((p) => ({ ...p, hora_inicio: value, hora_fin: "" }));
      return;
    }

    if (name === "espacio_id") {
      const esp = espacios.find((es) => String(es.id) === String(value));
      setEspacioSeleccionado(esp || null);
    }

    if (name === "motivo") {
      if (value.length > 0 && value.length < 15) {
        setErrMotivo("El motivo debe tener al menos 15 caracteres");
      } else {
        setErrMotivo("");
      }
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  // Opciones de hora inicio: excluir horas pasadas si la fecha es hoy
  const ahora = new Date();
  const horasInicio = HORAS.slice(0, -1).filter((h) => {
    if (form.fecha !== hoy) return true;
    const [hh, mm] = h.split(":").map(Number);
    const slotTime = new Date(ahora);
    slotTime.setHours(hh, mm, 0, 0);
    return slotTime > ahora;
  });
  const horasFin = form.hora_inicio ? HORAS.filter((h) => h > form.hora_inicio) : [];

  const verificarDisponibilidad = async () => {
    setError("");
    if (!form.espacio_id || !form.fecha || !form.hora_inicio || !form.hora_fin) {
      setError("Completa el espacio, la fecha y el horario antes de verificar.");
      return;
    }
    if (errFecha) { setError(errFecha); return; }
    const errHorario = validarHorario(getFechaInicio(), getFechaFin());
    if (errHorario) { setError(errHorario); return; }
    if (errMotivo) { setError(errMotivo); return; }
    setVerificando(true);
    try {
      const res = await api.post("/disponibilidad/verificar", {
        espacioId: form.espacio_id,
        fecha_inicio: getFechaInicio(),
        fecha_fin: getFechaFin(),
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
    const errHorario = validarHorario(getFechaInicio(), getFechaFin());
    if (errHorario) { setError(errHorario); return; }
    if (errMotivo) { setError(errMotivo); return; }
    setEnviando(true);
    try {
      await api.post("/reservaciones", {
        espacio_id: form.espacio_id,
        fecha_inicio: getFechaInicio(),
        fecha_fin: getFechaFin(),
        motivo: form.motivo,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear la reservación.");
    } finally {
      setEnviando(false);
    }
  };

  // Resumen legible del horario elegido
  const resumenHorario = (() => {
    if (!form.fecha || !form.hora_inicio || !form.hora_fin) return null;
    const [y, m, d] = form.fecha.split("-").map(Number);
    const fecha = new Date(y, m - 1, d);
    const nombreDia = fecha.toLocaleDateString("es-MX", { weekday: "long" });
    const nombreFecha = fecha.toLocaleDateString("es-MX", { day: "numeric", month: "long" });
    return `${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} ${nombreFecha} · ${formatHora(form.hora_inicio)} – ${formatHora(form.hora_fin)}`;
  })();

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

  const inputDisabled = { ...inputStyle, background: "#f9fafb", color: "#9ca3af", cursor: "not-allowed" };

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

        {/* Fecha */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            Fecha <span style={{ color: "#b91c1c" }}>*</span>
          </label>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            min={hoy}
            style={errFecha ? { ...inputStyle, borderColor: "#f87171" } : inputStyle}
          />
          {errFecha && (
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#b91c1c", display: "flex", alignItems: "center", gap: "5px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errFecha}
            </p>
          )}
          {!errFecha && !form.fecha && (
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#9ca3af" }}>
              Solo lunes a viernes · Horario 7:00 AM – 8:00 PM
            </p>
          )}
        </div>

        {/* Horario */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            Horario <span style={{ color: "#b91c1c" }}>*</span>
          </label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>Inicio</span>
              <select
                name="hora_inicio"
                value={form.hora_inicio}
                onChange={handleChange}
                style={!form.fecha || errFecha ? inputDisabled : inputStyle}
                disabled={!form.fecha || !!errFecha}
              >
                <option value="">-- Selecciona --</option>
                {horasInicio.map((h) => (
                  <option key={h} value={h}>{formatHora(h)}</option>
                ))}
              </select>
            </div>

            <span style={{ color: "#9ca3af", fontSize: "18px", marginTop: "18px", flexShrink: 0 }}>→</span>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>Fin</span>
              <select
                name="hora_fin"
                value={form.hora_fin}
                onChange={handleChange}
                style={!form.hora_inicio ? inputDisabled : inputStyle}
                disabled={!form.hora_inicio}
              >
                <option value="">-- Selecciona --</option>
                {horasFin.map((h) => (
                  <option key={h} value={h}>{formatHora(h)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Resumen legible */}
          {resumenHorario && (
            <div style={{
              marginTop: "6px", padding: "9px 14px", borderRadius: "8px",
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              fontSize: "13px", fontWeight: "600", color: "#15803d",
              display: "flex", alignItems: "center", gap: "7px",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {resumenHorario}
            </div>
          )}
        </div>

        {/* Motivo */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
            Motivo de la reservación{" "}
            <span style={{ fontSize: "13px", fontWeight: "400", color: "#6b7280" }}>(opcional)</span>
          </label>
          <textarea
            name="motivo"
            value={form.motivo}
            onChange={handleChange}
            rows={3}
            maxLength={50}
            placeholder="Describe el propósito de la reservación..."
            style={{ ...inputStyle, resize: "vertical", borderColor: errMotivo ? "#f87171" : "#d1d5db" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {errMotivo ? (
              <p style={{ margin: 0, fontSize: "13px", color: "#b91c1c", display: "flex", alignItems: "center", gap: "5px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {errMotivo}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
                {form.motivo.length === 0 ? "Mínimo 15 caracteres si deseas agregar un motivo" : ""}
              </p>
            )}
            <p style={{ margin: 0, fontSize: "12px", color: form.motivo.length >= 45 ? "#b45309" : "#9ca3af", flexShrink: 0 }}>
              {form.motivo.length}/50
            </p>
          </div>
        </div>

        {/* Mensajes */}
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
            "Elige la fecha (lunes a viernes) y el horario de 7:00 AM a 8:00 PM",
            "Verifica la disponibilidad del espacio",
            "Confirma tu reservación",
          ].map((texto, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: i < 3 ? "12px" : "0" }}>
              <div style={{
                background: "#fee2e2", color: "#b91c1c",
                borderRadius: "50%", width: "26px", height: "26px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "700", flexShrink: 0, marginTop: "1px",
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>{texto}</span>
            </div>
          ))}
        </div>

        {/* Panel restricciones */}
        <div style={{ background: "#fffbeb", borderRadius: "14px", border: "1.5px solid #fde68a", padding: "20px" }}>
          <p style={{ fontWeight: "700", fontSize: "14px", color: "#92400e", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Restricciones
          </p>
          <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: "13px", color: "#78350f", lineHeight: "1.8" }}>
            <li>Solo días hábiles: lunes a viernes</li>
            <li>Horario permitido: 7:00 AM – 8:00 PM</li>
            <li>La hora de fin debe ser posterior a la de inicio</li>
            <li>Duración mínima: 30 minutos</li>
            <li>Duración máxima: 8 horas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
