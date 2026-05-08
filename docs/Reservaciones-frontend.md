# 📋 Módulo Frontend — Reservaciones y Dashboard

**Integrante:** Cheluis (Integrante 5)  
**Rama:** `feature/frontend-reservaciones`  
**Materia:** Desarrollo de Servicios Web — 8vo Semestre  
**Instituto Tecnológico de Oaxaca**

---

## 📁 Archivos creados / modificados

| Archivo | Acción | Descripción |
|--------|--------|-------------|
| `frontend/src/pages/NuevaReservacion.jsx` | Modificado | Página del formulario de nueva reservación |
| `frontend/src/components/FormularioReservacion.jsx` | Creado | Componente reutilizable del formulario |
| `frontend/src/pages/Reservaciones.jsx` | Modificado | Historial de reservaciones con filtros |
| `frontend/src/components/ReservacionCard.jsx` | Creado | Tarjeta individual de cada reservación |
| `frontend/src/pages/Dashboard.jsx` | Modificado | Dashboard con estadísticas y actividad |
| `frontend/src/components/Sidebar.jsx` | Creado | Menú lateral izquierdo |
| `frontend/src/components/Layout.jsx` | Creado | Barra superior con topbar |
| `frontend/src/App.jsx` | Modificado | Layout general con sidebar + topbar |
| `frontend/src/components/Navbar.jsx` | Modificado | Vaciado (reemplazado por Sidebar) |
| `frontend/src/index.css` | Modificado | Limpieza de estilos globales de `nav` |

---

## 🗂️ Tarea 1 — Formulario de nueva reservación

### Archivos
- `frontend/src/pages/NuevaReservacion.jsx`
- `frontend/src/components/FormularioReservacion.jsx`

### ¿Qué hace?

`FormularioReservacion.jsx` es un componente reutilizable que contiene toda la lógica del formulario:

1. Al montarse hace `GET /api/espacios` para cargar los espacios en el selector.
2. Al seleccionar un espacio, muestra sus detalles en el panel derecho.
3. El usuario llena fecha-hora de inicio, fin y motivo (opcional).
4. Al presionar **"Verificar disponibilidad"** hace `GET /api/disponibilidad/espacio` y muestra el resultado en tiempo real.
5. Si está disponible, aparece el botón **"Confirmar reservación"**.
6. Al confirmar hace `POST /api/reservaciones` y redirige a `/reservaciones`.

`NuevaReservacion.jsx` es la página que importa el componente y maneja la redirección al confirmar.

### Endpoints utilizados

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/espacios` | Cargar lista de espacios |
| GET | `/api/disponibilidad/espacio` | Verificar disponibilidad |
| POST | `/api/reservaciones` | Crear la reservación |

### Código — `FormularioReservacion.jsx`

```jsx
import { useState, useEffect } from "react";
import api from "../api/axios";

export default function FormularioReservacion({ onSuccess }) {
  const [espacios, setEspacios] = useState([]);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [form, setForm] = useState({
    espacio_id: "", fecha_inicio: "", fecha_fin: "", motivo: "",
  });
  const [disponibilidad, setDisponibilidad] = useState(null);

  useEffect(() => {
    api.get("/espacios").then((res) => setEspacios(res.data));
  }, []);

  const verificarDisponibilidad = async () => {
    const res = await api.get("/disponibilidad/espacio", {
      params: { espacio_id: form.espacio_id, fecha_inicio: form.fecha_inicio, fecha_fin: form.fecha_fin },
    });
    setDisponibilidad(res.data.disponible);
  };

  const handleSubmit = async () => {
    await api.post("/reservaciones", form);
    onSuccess();
  };

  // ... render con layout de dos columnas
}
```

### Código — `NuevaReservacion.jsx`

```jsx
import { useNavigate } from "react-router-dom";
import FormularioReservacion from "../components/FormularioReservacion";

export default function NuevaReservacion() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "32px 36px", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
      <h1>Nueva Reservacion</h1>
      <p>Completa el formulario para reservar un espacio</p>
      <FormularioReservacion onSuccess={() => navigate("/reservaciones")} />
    </div>
  );
}
```

---

## 🗂️ Tarea 2 — Historial de reservaciones

### Archivos
- `frontend/src/pages/Reservaciones.jsx`
- `frontend/src/components/ReservacionCard.jsx`

### ¿Qué hace?

`Reservaciones.jsx` muestra el historial completo con:
- Título dinámico según rol: admin ve "Todas las Reservaciones", usuario ve "Mis Reservaciones".
- Filtros por estado: Todas, Activas, Canceladas, Completadas.
- Botón **"+ Nueva"** para ir al formulario.
- Lista de reservaciones usando el componente `ReservacionCard`.
- Al cancelar, pide confirmación y actualiza la lista automáticamente.

`ReservacionCard.jsx` muestra por cada reservación:
- Ícono del espacio, nombre y badge de estado con color.
- Nombre y email del usuario (si está disponible).
- Fecha de inicio y fin formateadas en español.
- Motivo (si existe).
- Botón "Cancelar" visible solo si el estado es `pendiente` o `confirmada` y el usuario es dueño o admin.

### Badges de estado

| Estado | Color fondo | Color texto |
|--------|------------|-------------|
| pendiente | Amarillo `#fef9c3` | `#854d0e` |
| confirmada | Verde `#dcfce7` | `#166534` |
| cancelada | Gris `#f1f5f9` | `#475569` |
| completada | Azul `#dbeafe` | `#1e40af` |

### Endpoints utilizados

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/reservaciones` | Cargar lista de reservaciones |
| PATCH | `/api/reservaciones/:id/cancelar` | Cancelar una reservación |

### Lógica de roles

```jsx
// Mostrar cancelar solo si es dueño o admin
const puedeCanc = (r.estado === 'pendiente' || r.estado === 'confirmada') &&
  (usuario?.rol === 'admin' || usuario?.id === r.usuario_id);
```

---

## 🗂️ Tarea 3 — Componente FormularioReservacion

Completada en la **Tarea 1**. El formulario fue extraído desde el inicio como componente reutilizable en `FormularioReservacion.jsx`, separado de la página `NuevaReservacion.jsx`.

---

## 🗂️ Tarea 4 — Dashboard mejorado

### Archivo
- `frontend/src/pages/Dashboard.jsx`

### ¿Qué hace?

El Dashboard fue rediseñado completamente con:

**Banner de bienvenida:**
- Saludo personalizado con el nombre del usuario.
- Badge de rol (Admin/Usuario).
- Fecha actual en español.
- Botones de acceso rápido: "Gestionar Espacios" (solo admin) y "Nueva Reservacion".

**4 tarjetas de estadísticas:**
- Total de reservaciones del usuario.
- Reservaciones activas (pendiente + confirmada).
- Notificaciones sin leer.
- Espacios disponibles.

**Panel "Próximas reservaciones":**
- Muestra las 3 próximas reservaciones activas ordenadas por fecha.
- Enlace "Ver todas" hacia `/reservaciones`.

**Panel "Actividad reciente":**
- Muestra las últimas 3 notificaciones.
- Indicador rojo para notificaciones no leídas.
- Enlace "Ver todas" hacia `/notificaciones`.

### Endpoints utilizados

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/reservaciones` | Total y reservaciones activas |
| GET | `/api/notificaciones` | Notificaciones sin leer y actividad |
| GET | `/api/espacios` | Espacios disponibles |

---

## 🗂️ Extra — Rediseño del layout general

### Archivos
- `frontend/src/components/Sidebar.jsx`
- `frontend/src/components/Layout.jsx`
- `frontend/src/App.jsx`
- `frontend/src/components/Navbar.jsx`
- `frontend/src/index.css`

### ¿Qué se hizo?

El sistema original tenía un navbar horizontal azul. Se reemplazó completamente por un layout moderno con:

**Sidebar izquierdo (`Sidebar.jsx`):**
- Fondo oscuro `#1e2139`.
- Logo "ReservaITO" con ícono en rojo.
- Badge de rol (Administrador / Usuario).
- Links de navegación con íconos SVG.
- Link activo resaltado en rojo `#c0392b`.
- Badge de notificaciones no leídas.
- Sección inferior con nombre, iniciales y botón "Cerrar sesión".

**Topbar superior (`Layout.jsx`):**
- Fondo blanco con línea roja decorativa.
- Título "Sistema de Reservaciones" y subtítulo institucional.
- Botón modo oscuro (decorativo).
- Campana con badge de notificaciones.
- Nombre del usuario, badge ADMIN y avatar con iniciales.

**`App.jsx`** fue actualizado para usar el nuevo layout con `display: flex`:
```jsx
<div style={{ display: 'flex', minHeight: '100vh' }}>
  <Sidebar />
  <div style={{ marginLeft: '260px', flex: 1 }}>
    <Layout>
      <Routes>...</Routes>
    </Layout>
  </div>
</div>
```

**`index.css`** se limpió eliminando los estilos globales de `nav` que interferían con el sidebar.

---

## ✅ Estado de tareas

| Tarea | Estado |
|-------|--------|
| Formulario de nueva reservación (`NuevaReservacion.jsx`) | ✅ Completada |
| Componente reutilizable (`FormularioReservacion.jsx`) | ✅ Completada |
| Historial de reservaciones (`Reservaciones.jsx`) | ✅ Completada |
| Componente tarjeta (`ReservacionCard.jsx`) | ✅ Completada |
| Dashboard mejorado (`Dashboard.jsx`) | ✅ Completada |
| Rediseño layout con sidebar | ✅ Completada |
