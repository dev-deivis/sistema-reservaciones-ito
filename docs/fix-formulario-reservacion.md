# Fix — Formulario de Reservación: Endpoint Incorrecto

**Integrante:** Cheluis (Integrante 5)  
**Rama:** `fix/formulario-reservacion-endpoint`  
**Prioridad:** Alta  
**Módulo afectado:** Frontend — Nueva Reservación  

---

## Descripción del bug

El botón "Verificar disponibilidad" en el formulario de nueva reservación llamaba a un endpoint que no existe en el backend (`GET /api/disponibilidad/espacio`). Esto provocaba que la verificación siempre fallara con un error de red y el usuario nunca pudiera ver si el espacio estaba disponible ni confirmar una reservación.

---

## Causa raíz

En `frontend/src/components/FormularioReservacion.jsx` se usaba:

- Método: `GET` — incorrecto, el backend espera `POST`
- Ruta: `/disponibilidad/espacio` — no existe en el backend
- Los parámetros se mandaban como `params` (query string) en lugar del body
- El campo `espacio_id` debía llamarse `espacioId`

El endpoint correcto del backend es `POST /api/disponibilidad/verificar` y espera un body JSON.

---

## Solución aplicada

Se modificó la función `verificarDisponibilidad` en `FormularioReservacion.jsx`:

### Antes (código incorrecto)

```js
const res = await api.get("/disponibilidad/espacio", {
  params: {
    espacio_id: form.espacio_id,
    fecha_inicio: form.fecha_inicio,
    fecha_fin: form.fecha_fin,
  },
});
setDisponibilidad(res.data.disponible);
```

### Después (código corregido)

```js
const res = await api.post("/disponibilidad/verificar", {
  espacioId: form.espacio_id,
  fecha_inicio: form.fecha_inicio,
  fecha_fin: form.fecha_fin,
});
setDisponibilidad(res.data.disponible);
```

### Diferencias clave

| | Antes | Después |
|---|---|---|
| Método HTTP | `GET` | `POST` |
| Ruta | `/disponibilidad/espacio` | `/disponibilidad/verificar` |
| Parámetros | `params` (query string) | Body JSON |
| Nombre del campo | `espacio_id` | `espacioId` |

---

## Endpoint correcto documentado

### `POST /api/disponibilidad/verificar`

**Request body:**
```json
{
  "espacioId": 1,
  "fecha_inicio": "2026-06-10T08:00",
  "fecha_fin": "2026-06-10T10:00"
}
```

**Response — disponible:**
```json
{
  "disponible": true
}
```

**Response — no disponible:**
```json
{
  "disponible": false,
  "conflictos": {
    "reservaciones": [...],
    "bloqueados": []
  }
}
```

---

## Pasos para verificar que el fix funciona

1. Levantar backend: `cd backend && npm run dev`
2. Levantar frontend: `cd frontend && npm run dev`
3. Iniciar sesión con `juan@ito.mx` / `password`
4. Ir a **Nueva Reservación**
5. Seleccionar un espacio y un rango de fechas libre
6. Hacer clic en **"Verificar disponibilidad"**
7. Debe aparecer el mensaje verde ✅ "El espacio está disponible en ese horario"
8. El botón **"Confirmar reservación"** debe aparecer y al hacer clic debe crear la reservación correctamente