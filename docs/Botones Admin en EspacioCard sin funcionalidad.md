# Fix: Botones Admin en EspacioCard sin funcionalidad

**Rama:** `fix/espaciocard-botones-admin`  
**Módulo afectado:** Frontend — `EspacioCard` (vista Espacios, rol admin)  
**Prioridad:** Baja  
**Archivo modificado:** `frontend/src/components/EspacioCard.jsx`

---

## Descripción del problema

Los botones **"Editar"** y **"Eliminar"** que se renderizan exclusivamente para usuarios con rol `admin` dentro del componente `EspacioCard` estaban visualmente presentes y correctamente condicionados por el rol, pero carecían de manejadores de eventos (`onClick`). Al hacer clic sobre cualquiera de los dos botones no ocurría ninguna acción: no se realizaba ninguna llamada a la API, no había redirección y no se mostraba ningún mensaje de retroalimentación al usuario.

```jsx
// Estado anterior — botones sin onClick
{usuario?.rol === 'admin' && (
  <div style={{ display: 'flex', gap: '0.6rem' }}>
    <button style={{ ... }}>Editar</button>
    <button style={{ ... }}>Eliminar</button>
  </div>
)}
```

---

## Solución aplicada

Se realizaron tres modificaciones en `EspacioCard.jsx`:

### 1. Import de `api`

Se agregó la importación del cliente HTTP compartido para poder realizar llamadas autenticadas al backend:

```jsx
import api from '../api/axios';
```

### 2. Handler `handleEditar`

Se delega la edición a `GestionEspacios.jsx`, que ya contiene el formulario y la lógica completa de actualización. El handler redirige pasando el `id` del espacio como query param:

```jsx
const handleEditar = () => {
  window.location.href = `/gestion?editar=${espacio.id}`;
};
```

> **Por qué esta aproximación:** evita duplicar el formulario de edición dentro de `EspacioCard`. `GestionEspacios` lee el parámetro `?editar=:id` al montar y abre automáticamente el modal/formulario de edición con los datos precargados.

### 3. Handler `handleEliminar`

Solicita confirmación explícita al usuario antes de ejecutar el borrado. Si el usuario confirma, realiza la llamada `DELETE` al endpoint correspondiente y recarga la página para reflejar el cambio:

```jsx
const handleEliminar = async () => {
  if (!confirm(`¿Eliminar "${espacio.nombre}"? Esta acción no se puede deshacer.`)) return;
  try {
    await api.delete(`/espacios/${espacio.id}`);
    window.location.reload();
  } catch (err) {
    alert(err.response?.data?.error || 'Error al eliminar el espacio');
  }
};
```

### 4. Conexión de `onClick` en los botones

```jsx
<button onClick={handleEditar}  style={{ ... }}>Editar</button>
<button onClick={handleEliminar} style={{ ... }}>Eliminar</button>
```

---

## Comportamiento de cada botón

| Botón | Acción | Endpoint llamado |
|---|---|---|
| **Editar** | Redirige al usuario a `/gestion?editar=:id` | — *(la lógica de edición reside en `GestionEspacios.jsx`)* |
| **Eliminar** | Muestra diálogo de confirmación → si confirma, llama `DELETE /api/espacios/:id` → recarga la página | `DELETE /api/espacios/:id` |

---

## Errores posibles

### 409 — Espacio con reservas activas

El backend rechaza el borrado si el espacio tiene reservas activas asociadas y responde con HTTP `409 Conflict`.

**Mensaje mostrado al usuario:**

```
El mensaje devuelto por el servidor, por ejemplo:
"No se puede eliminar el espacio porque tiene reservas activas."
```

El bloque `catch` en `handleEliminar` extrae el mensaje del campo `error` del cuerpo de la respuesta:

```js
alert(err.response?.data?.error || 'Error al eliminar el espacio');
```

Si el backend no devuelve un campo `error` en el JSON, se muestra el mensaje de fallback genérico:  
**`"Error al eliminar el espacio"`**

### Otros errores

| Código HTTP | Causa probable | Mensaje al usuario |
|---|---|---|
| `401 Unauthorized` | Sesión expirada o token inválido | Mensaje del backend o fallback genérico |
| `403 Forbidden` | El usuario no tiene permiso para eliminar | Mensaje del backend o fallback genérico |
| `404 Not Found` | El espacio ya no existe en la base de datos | Mensaje del backend o fallback genérico |
| `500 Internal Server Error` | Error inesperado en el servidor | Fallback: `"Error al eliminar el espacio"` |

---

## Cómo verificar

1. Iniciar sesión como `admin@ito.mx` / `password`
2. Navegar a la sección **"Espacios"**
3. **Flujo Eliminar:**
   - Hacer clic en **"Eliminar"** sobre un espacio sin reservas activas
   - Debe aparecer el diálogo de confirmación con el nombre del espacio
   - Al confirmar, el espacio desaparece de la lista tras la recarga
   - Repetir con un espacio **con reservas activas** → debe mostrarse el mensaje de error `409`
4. **Flujo Editar:**
   - Hacer clic en **"Editar"**
   - Debe redirigir a `/gestion?editar=<id>` con el formulario de edición precargado

---

## Archivos modificados

```
frontend/src/components/EspacioCard.jsx
```