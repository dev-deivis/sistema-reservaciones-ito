# Tareas de corrección — Sistema de Reservaciones ITO

**Proyecto:** Sistema de reservaciones de espacios institucionales  
**Materia:** Desarrollo de Servicios Web — 8vo Semestre  
**Instituto Tecnológico de Oaxaca**  
**Fecha:** Mayo 2026

> Estas tareas corrigen bugs detectados durante la revisión del proyecto integrado. Cada una tiene un archivo específico a modificar y las instrucciones exactas de qué cambiar y por qué.

---

## Flujo de trabajo

Mismas reglas que en `TASKS.md`: rama propia, commits descriptivos en español, Pull Request a `main`. No hacer push directo a `main`.

---

## Integrante — Cheluis

**Rama:** `fix/formulario-reservacion-endpoint`  
**Prioridad:** Alta  
**Módulo afectado:** Frontend — Nueva Reservación

### Descripción del bug

El botón "Verificar disponibilidad" en el formulario de nueva reservación llama a un endpoint que **no existe** en el backend (`GET /api/disponibilidad/espacio`). Esto provoca que la verificación siempre falle y el usuario nunca pueda confirmar una reservación.

### Tarea

Corregir `frontend/src/components/FormularioReservacion.jsx` para que use el endpoint correcto.

**Qué cambiar — líneas 56-76:**

Actualmente:
```js
const verificarDisponibilidad = async () => {
  // ...
  try {
    const res = await api.get("/disponibilidad/espacio", {
      params: {
        espacio_id: form.espacio_id,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
      },
    });
    setDisponibilidad(res.data.disponible);
  }
```

Debe quedar:
```js
const verificarDisponibilidad = async () => {
  // ...
  try {
    const res = await api.post("/disponibilidad/verificar", {
      espacioId: form.espacio_id,
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
    });
    setDisponibilidad(res.data.disponible);
  }
```

**Diferencias clave:**
- Cambiar `api.get` → `api.post`
- Cambiar la ruta `/disponibilidad/espacio` → `/disponibilidad/verificar`
- Cambiar `params:` → mandar el body directamente (sin `params:`)
- Cambiar el key `espacio_id` → `espacioId` (así lo espera el backend)

**Archivo a modificar:**
```
frontend/src/components/FormularioReservacion.jsx
```

**Cómo verificar que funciona:**
1. Levantar backend y frontend (`npm run dev` en cada uno)
2. Iniciar sesión con `juan@ito.mx` / `password`
3. Ir a "Nueva Reservación", seleccionar un espacio y un rango de fechas libre
4. Hacer clic en "Verificar disponibilidad"
5. Debe aparecer el mensaje verde "El espacio está disponible en ese horario"
6. El botón "Confirmar reservación" debe aparecer y al hacer clic debe crear la reservación

### Documentación

Crear el archivo `docs/fix-formulario-reservacion.md` con:

- **Descripción del bug:** qué estaba mal y por qué fallaba
- **Causa raíz:** se llamaba `GET /disponibilidad/espacio` en lugar de `POST /disponibilidad/verificar`
- **Solución aplicada:** mostrar el fragmento de código antes y después del cambio
- **Endpoint correcto:** documentar el contrato de `POST /api/disponibilidad/verificar` con ejemplos de request y response:

```json
// Request body
{ "espacioId": 1, "fecha_inicio": "2026-06-10T08:00", "fecha_fin": "2026-06-10T10:00" }

// Response — disponible
{ "disponible": true }

// Response — no disponible
{ "disponible": false, "conflictos": { "reservaciones": [...], "bloqueados": [] } }
```

**Archivo a crear:**
```
docs/fix-formulario-reservacion.md
```

---

## Integrante — Alex

**Rama:** `fix/reservaciones-endpoint-usuario`  
**Prioridad:** Alta  
**Módulo afectado:** Frontend — Lista de Reservaciones

### Descripción del bug

En `Reservaciones.jsx`, tanto el rol `admin` como el rol `usuario` consumen el endpoint `GET /api/reservaciones`. El problema es que ese endpoint está protegido con `authAdmin`, por lo que los usuarios normales reciben un error **403 Forbidden** al intentar ver sus reservaciones. La ruta correcta para usuarios es `GET /api/reservaciones/mis-reservaciones`.

### Tarea

Corregir `frontend/src/pages/Reservaciones.jsx` para que los usuarios normales usen su endpoint correspondiente.

**Qué cambiar — línea 18:**

Actualmente:
```js
const url = usuario?.rol === 'admin' ? '/reservaciones' : '/reservaciones';
```

Debe quedar:
```js
const url = usuario?.rol === 'admin' ? '/reservaciones' : '/reservaciones/mis-reservaciones';
```

Es una sola línea. El error original fue que ambos lados del ternario tenían el mismo valor.

**Archivo a modificar:**
```
frontend/src/pages/Reservaciones.jsx
```

**Cómo verificar que funciona:**
1. Iniciar sesión con `juan@ito.mx` / `password` (rol `usuario`)
2. Ir a la sección "Reservaciones"
3. Debe cargar la lista de reservaciones sin error 403
4. Iniciar sesión con `admin@ito.mx` / `password` (rol `admin`)
5. Ir a "Reservaciones" → debe seguir mostrando todas las reservaciones del sistema

### Documentación

Crear el archivo `docs/fix-reservaciones-endpoint.md` con:

- **Descripción del bug:** los usuarios normales recibían 403 porque se usaba el endpoint de admin
- **Causa raíz:** ambos lados del ternario apuntaban a `/reservaciones` (que requiere `authAdmin`)
- **Solución aplicada:** mostrar la línea antes y después del cambio
- **Tabla de endpoints por rol:**

| Rol | Endpoint correcto | Middleware |
|-----|------------------|-----------|
| `admin` | `GET /api/reservaciones` | `authAdmin` — devuelve todas |
| `usuario` | `GET /api/reservaciones/mis-reservaciones` | `auth` — devuelve solo las del usuario |

**Archivo a crear:**
```
docs/fix-reservaciones-endpoint.md
```

---

## Integrante — Heber

**Rama:** `fix/gestion-espacios-crud`  
**Prioridad:** Media  
**Módulo afectado:** Frontend — Gestión de Espacios (vista admin)

### Descripción del bug

En `GestionEspacios.jsx`, los botones "Agregar nuevo espacio", "Editar" y "Eliminar" son visuales pero no hacen nada. Las funciones `handleEditar` y `handleEliminar` solo tienen `console.log`, y el botón de crear no tiene `onClick`.

### Tareas

Implementar las tres acciones en `frontend/src/pages/GestionEspacios.jsx`.

#### 1. Eliminar espacio

Reemplazar la función `handleEliminar` actual:
```js
const handleEliminar = (espacio) => {
  console.log('Eliminar espacio:', espacio);
};
```

Por esta implementación:
```js
const handleEliminar = async (espacio) => {
  if (!confirm(`¿Eliminar "${espacio.nombre}"? Esta acción no se puede deshacer.`)) return;
  try {
    await api.delete(`/espacios/${espacio.id}`);
    setEspacios(prev => prev.filter(e => e.id !== espacio.id));
  } catch (err) {
    alert(err.response?.data?.error || 'Error al eliminar el espacio');
  }
};
```

Y conectar el botón eliminar en la tabla (ya existe, solo añade el onClick):
```jsx
<button onClick={() => handleEliminar(e)} ...>
```

#### 2. Crear espacio — agregar modal

Agregar estado para controlar el modal al inicio del componente (junto a los otros `useState`):
```js
const [modalCrear, setModalCrear] = useState(false);
const [nuevoEspacio, setNuevoEspacio] = useState({ nombre: '', capacidad: '', ubicacion: '', tipo_espacio_id: '' });
const [tipos, setTipos] = useState([]);
```

Cargar los tipos de espacio junto con los espacios en el `useEffect` existente:
```js
useEffect(() => {
  Promise.all([
    api.get('/espacios'),
    api.get('/tipos-espacio'),
  ]).then(([resE, resT]) => {
    setEspacios(resE.data);
    setTipos(resT.data);
  }).finally(() => setCargando(false));
}, []);
```

> **Nota:** Si el endpoint `GET /api/tipos-espacio` no existe en el backend, hacer solo `api.get('/espacios')` y extraer los tipos únicos de los espacios ya cargados:
> ```js
> const tiposUnicos = [...new Map(espacios.map(e => [e.tipo_espacio_id, { id: e.tipo_espacio_id, nombre: e.tipo_nombre }])).values()];
> ```

Función para guardar el nuevo espacio:
```js
const handleCrear = async () => {
  try {
    const { data } = await api.post('/espacios', {
      ...nuevoEspacio,
      capacidad: Number(nuevoEspacio.capacidad),
    });
    setEspacios(prev => [...prev, data]);
    setModalCrear(false);
    setNuevoEspacio({ nombre: '', capacidad: '', ubicacion: '', tipo_espacio_id: '' });
  } catch (err) {
    alert(err.response?.data?.error || 'Error al crear el espacio');
  }
};
```

Conectar el botón "Agregar nuevo espacio" existente:
```jsx
<button onClick={() => setModalCrear(true)} ...>
  Agregar nuevo espacio
</button>
```

Agregar el modal al final del JSX (antes del `</div>` de cierre):
```jsx
{modalCrear && (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px' }}>
      <h3 style={{ margin: '0 0 1.5rem 0' }}>Nuevo espacio</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input placeholder="Nombre *" value={nuevoEspacio.nombre}
          onChange={e => setNuevoEspacio({ ...nuevoEspacio, nombre: e.target.value })}
          style={{ padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
        <input type="number" placeholder="Capacidad *" value={nuevoEspacio.capacidad}
          onChange={e => setNuevoEspacio({ ...nuevoEspacio, capacidad: e.target.value })}
          style={{ padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
        <input placeholder="Ubicación" value={nuevoEspacio.ubicacion}
          onChange={e => setNuevoEspacio({ ...nuevoEspacio, ubicacion: e.target.value })}
          style={{ padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '8px' }} />
        <select value={nuevoEspacio.tipo_espacio_id}
          onChange={e => setNuevoEspacio({ ...nuevoEspacio, tipo_espacio_id: e.target.value })}
          style={{ padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '8px' }}>
          <option value="">Tipo de espacio *</option>
          {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
        <button onClick={() => setModalCrear(false)}
          style={{ padding: '0.7rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', background: 'white' }}>
          Cancelar
        </button>
        <button onClick={handleCrear}
          style={{ padding: '0.7rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#c62828', color: 'white', fontWeight: '600' }}>
          Guardar
        </button>
      </div>
    </div>
  </div>
)}
```

#### 3. Editar espacio — agregar modal

Similar al de crear. Agregar estado:
```js
const [modalEditar, setModalEditar] = useState(false);
const [espacioEditando, setEspacioEditando] = useState(null);
```

Reemplazar `handleEditar`:
```js
const handleEditar = (espacio) => {
  setEspacioEditando({ ...espacio, tipo_espacio_id: espacio.tipo_espacio_id || '' });
  setModalEditar(true);
};
```

Función para guardar cambios:
```js
const handleGuardarEdicion = async () => {
  try {
    const { data } = await api.put(`/espacios/${espacioEditando.id}`, {
      nombre: espacioEditando.nombre,
      capacidad: Number(espacioEditando.capacidad),
      ubicacion: espacioEditando.ubicacion,
      estado: espacioEditando.estado,
      tipo_espacio_id: espacioEditando.tipo_espacio_id,
    });
    setEspacios(prev => prev.map(e => e.id === data.id ? { ...data, tipo_nombre: e.tipo_nombre } : e));
    setModalEditar(false);
  } catch (err) {
    alert(err.response?.data?.error || 'Error al actualizar el espacio');
  }
};
```

El modal de editar es igual al de crear pero con los campos pre-llenados con `espacioEditando` y llama a `handleGuardarEdicion`. Agrégalo al JSX debajo del modal de crear.

**Archivos a modificar:**
```
frontend/src/pages/GestionEspacios.jsx
```

**Cómo verificar que funciona:**
1. Iniciar sesión como `admin@ito.mx` / `password`
2. Ir a "Gestión de Espacios"
3. Hacer clic en "Agregar nuevo espacio" → debe aparecer el modal → llenar campos → Guardar → debe aparecer en la tabla
4. Hacer clic en el ícono de editar de un espacio → modal pre-llenado → cambiar algo → Guardar → la tabla debe reflejar el cambio
5. Hacer clic en eliminar → confirmación → el espacio desaparece de la tabla

### Documentación

Crear el archivo `docs/gestion-espacios-crud.md` con:

- **Descripción:** qué funcionalidades se implementaron y por qué estaban incompletas
- **Funcionalidades agregadas:** crear espacio, editar espacio, eliminar espacio
- **Endpoints utilizados** con ejemplos de request y response:

| Acción | Método | Endpoint | Body requerido |
|--------|--------|----------|----------------|
| Crear | `POST` | `/api/espacios` | `{ nombre, capacidad, ubicacion, tipo_espacio_id }` |
| Editar | `PUT` | `/api/espacios/:id` | `{ nombre, capacidad, ubicacion, estado, tipo_espacio_id }` |
| Eliminar | `DELETE` | `/api/espacios/:id` | — |

- **Respuestas posibles:** incluir el JSON de respuesta exitosa y los posibles errores (400, 404, 409)
- **Validaciones del backend que hay que respetar:** capacidad entre 1 y 50, nombre y tipo_espacio_id obligatorios, no se puede eliminar si tiene reservaciones activas

**Archivo a crear:**
```
docs/gestion-espacios-crud.md
```

---

## Integrante — Karla

**Rama:** `fix/espaciocard-botones-admin`  
**Prioridad:** Baja  
**Módulo afectado:** Frontend — EspacioCard (vista admin en Espacios)

### Descripción del bug

En `EspacioCard.jsx`, los botones "Editar" y "Eliminar" que se muestran a los administradores tienen estilo pero no tienen `onClick` conectado. Al hacer clic no pasa nada.

### Tarea

Conectar los botones de admin en `frontend/src/components/EspacioCard.jsx` para que llamen a los mismos endpoints que `GestionEspacios.jsx`.

**Qué cambiar — líneas 98-101:**

Actualmente:
```jsx
{usuario?.rol === 'admin' && (
  <div style={{ display: 'flex', gap: '0.6rem' }}>
    <button style={{ ... }}>Editar</button>
    <button style={{ ... }}>Eliminar</button>
  </div>
)}
```

Debe quedar (agregar los handlers y el estado de edición directamente en la card):

Primero, agregar la función de eliminar dentro del componente `EspacioCard` (antes del `return`):
```js
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

Para editar, la forma más simple es redirigir a la vista de gestión con el id del espacio (ya que la lógica de edición completa está en `GestionEspacios.jsx`). Agregar también:
```js
const handleEditar = () => {
  window.location.href = `/gestion?editar=${espacio.id}`;
};
```

Conectar los `onClick` en los botones:
```jsx
<button onClick={handleEditar} style={{ ... }}>Editar</button>
<button onClick={handleEliminar} style={{ ... }}>Eliminar</button>
```

Agregar el import de `api` al inicio del archivo (si no está):
```js
import api from '../api/axios';
```

**Archivos a modificar:**
```
frontend/src/components/EspacioCard.jsx
```

**Cómo verificar que funciona:**
1. Iniciar sesión como `admin@ito.mx` / `password`
2. Ir a "Espacios"
3. Hacer clic en "Eliminar" de cualquier espacio sin reservaciones activas → confirmación → debe desaparecer de la lista (tras recarga)
4. Hacer clic en "Editar" → debe redirigir a `/gestion`

### Documentación

Crear el archivo `docs/fix-espaciocard-botones.md` con:

- **Descripción del problema:** los botones admin en `EspacioCard` no tenían funcionalidad real
- **Solución aplicada:** qué handlers se agregaron y cómo se conectaron al API
- **Comportamiento de cada botón:**

| Botón | Acción | Endpoint llamado |
|-------|--------|-----------------|
| Editar | Redirige a `/gestion?editar=:id` | — (la lógica está en GestionEspacios) |
| Eliminar | Confirmación → `DELETE /api/espacios/:id` → recarga la página | `DELETE /api/espacios/:id` |

- **Errores posibles:** si el espacio tiene reservaciones activas, el backend responde 409 — documentar el mensaje que se muestra al usuario

**Archivo a crear:**
```
docs/fix-espaciocard-botones.md
```

---

## Tabla resumen

| Integrante | Archivo | Prioridad | Tipo |
|-----------|---------|-----------|------|
| Cheluis | `frontend/src/components/FormularioReservacion.jsx` | Alta | Bug — endpoint incorrecto |
| Alex | `frontend/src/pages/Reservaciones.jsx` | Alta | Bug — endpoint incorrecto |
| Heber | `frontend/src/pages/GestionEspacios.jsx` | Media | Feature incompleta — CRUD |
| Karla | `frontend/src/components/EspacioCard.jsx` | Baja | Feature incompleta — botones admin |
