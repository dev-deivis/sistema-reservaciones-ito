# Tareas del Equipo — Sistema de Reservaciones ITO

**Proyecto:** Sistema de reservaciones de espacios institucionales  
**Materia:** Desarrollo de Servicios Web — 8vo Semestre  
**Instituto Tecnológico de Oaxaca**  
**Fecha:** Mayo 2026

> La arquitectura base del proyecto (estructura de carpetas, servidor Express, conexión a PostgreSQL, middleware JWT, rutas montadas y esquema de la base de datos) ya está completamente lista. Cada integrante retoma desde ese punto y completa su módulo asignado.

---

## Flujo de trabajo con Git — instrucciones para todos

```bash
# 1. Clonar el repositorio (solo la primera vez)
git clone <url-del-repo>
cd reservaciones-ito

# 2. Crear y cambiar a tu rama (reemplaza con tu rama asignada)
git checkout -b feature/nombre-de-tu-rama

# 3. Antes de empezar a trabajar cada día, jalarte los últimos cambios de main
git fetch origin
git merge origin/main

# 4. Guardar tu avance frecuentemente
git add src/controllers/tuController.js
git commit -m "descripción breve de lo que hiciste"

# 5. Subir tu rama al repositorio remoto
git push origin feature/nombre-de-tu-rama

# 6. Cuando tu módulo esté listo, abrir un Pull Request en GitHub/GitLab:
#    base: main  ←  compare: feature/nombre-de-tu-rama
#    Esperar revisión de al menos un compañero antes de hacer merge
```

> **Regla:** Nunca hacer push directo a `main`. Todo entra por Pull Request.

---

## Convenciones de commits

Los mensajes de commit van en **español**, en modo imperativo y descriptivo:

```bash
# Correcto
git commit -m "agrega validación de conflictos de horario en disponibilidad"
git commit -m "corrige error al cancelar reservación ya cancelada"
git commit -m "conecta formulario de nueva reservación con el endpoint POST"

# Incorrecto
git commit -m "fix"
git commit -m "cambios"
git commit -m "working on it"
```

Prefijos sugeridos:

| Prefijo | Cuándo usarlo |
|---------|--------------|
| `agrega` | Nueva funcionalidad o archivo |
| `corrige` | Bug fix |
| `actualiza` | Modificación a algo existente |
| `elimina` | Borrar código o archivos |
| `documenta` | Solo cambios de documentación |
| `refactoriza` | Reestructura sin cambiar comportamiento |

---

## Integrante 1 — David

**Rama:** `feature/modulo-disponibilidad`  
**Módulo:** Disponibilidad de espacios  
**Descripción:** Implementar la lógica que permite consultar en tiempo real si un espacio está libre en un rango de fechas y horas dado, detectando conflictos contra reservaciones activas y horarios bloqueados.

### Tareas

1. Revisar el archivo `backend/src/controllers/disponibilidadController.js` — ya tiene una base, completar la lógica faltante.
2. Implementar el endpoint `GET /api/disponibilidad/:espacioId` que recibe `fecha` como query param (`YYYY-MM-DD`) y devuelve todos los bloques ocupados de ese día para ese espacio.
3. Implementar el endpoint `POST /api/disponibilidad/verificar` que recibe en el body `{ espacioId, fecha_inicio, fecha_fin }` y responde si el espacio está disponible o no, con detalle del conflicto si aplica.
4. La lógica de verificación debe consultar dos tablas: `reservaciones` (estados distintos de `cancelada`) y `horarios_bloqueados`. Si hay solapamiento en cualquiera de las dos, responder `disponible: false`.
5. Usar el operador `OVERLAPS` de PostgreSQL para detectar solapamientos de forma precisa.
6. Manejar el caso donde el `espacioId` no existe (responder 404).
7. Manejar el caso donde `fecha_inicio >= fecha_fin` (responder 400 con mensaje descriptivo).
8. Actualizar `backend/src/routes/disponibilidad.js` para registrar las dos rutas nuevas con el middleware `auth`.
9. Documentar los dos endpoints con ejemplos de request y response en JSON en el archivo `docs/disponibilidad.md`.

**Archivos a modificar:**
```
backend/src/controllers/disponibilidadController.js
backend/src/routes/disponibilidad.js
```

**Archivos a crear:**
```
docs/disponibilidad.md
```

**Ejemplos de respuesta esperada:**

`POST /api/disponibilidad/verificar` — espacio libre:
```json
{ "disponible": true }
```

`POST /api/disponibilidad/verificar` — espacio ocupado:
```json
{
  "disponible": false,
  "conflictos": {
    "reservaciones": [{ "id": 3, "fecha_inicio": "...", "fecha_fin": "..." }],
    "bloqueados": []
  }
}
```

---

## Integrante 2 — Isaac

**Rama:** `feature/modulo-espacios`  
**Módulo:** Espacios (backend)  
**Descripción:** Completar el CRUD completo de espacios y agregar el endpoint para consultar los recursos asociados a cada espacio.

### Tareas

1. Revisar `backend/src/controllers/espaciosController.js` — la base existe, asegurarse de que los 5 endpoints CRUD funcionen correctamente.
2. Verificar que `GET /api/espacios` devuelva también el nombre del tipo de espacio (join con `tipo_espacio`).
3. Verificar que `GET /api/espacios/:id` devuelva los recursos del espacio (join con tabla `recursos`) en un array `recursos`.
4. Implementar el endpoint `GET /api/espacios/:id/recursos` que devuelve únicamente el listado de recursos de un espacio.
5. Agregar validación en `POST /api/espacios`: campos requeridos son `nombre`, `capacidad` y `tipo_espacio_id`. Responder 400 si faltan.
6. Agregar validación en `PUT /api/espacios/:id`: si el espacio no existe, responder 404.
7. En `DELETE /api/espacios/:id`: si el espacio tiene reservaciones activas (estado `pendiente` o `confirmada`), rechazar la eliminación con 409 y un mensaje claro.
8. Proteger rutas de escritura (`POST`, `PUT`, `DELETE`) con el middleware `authAdmin`; rutas de lectura con `auth`.
9. Actualizar `backend/src/routes/espacios.js` con la ruta nueva de recursos.
10. Documentar los 6 endpoints con ejemplos de request y response en JSON en `docs/espacios.md`.

**Archivos a modificar:**
```
backend/src/controllers/espaciosController.js
backend/src/routes/espacios.js
```

**Archivos a crear:**
```
docs/espacios.md
```

---

## Integrante 3 — Alex

**Rama:** `feature/modulo-reservaciones`  
**Módulo:** Reservaciones (backend)  
**Descripción:** Completar el módulo de reservaciones con toda la lógica de negocio: crear, cancelar, modificar, y registrar automáticamente cada acción en el historial de cambios.

### Tareas

1. Revisar `backend/src/controllers/reservacionesController.js` — la base existe, completar y fortalecer la lógica.
2. En `POST /api/reservaciones`: antes de crear la reservación, hacer una llamada interna a la lógica de disponibilidad (reutilizar la misma query SQL del módulo de David o importar la función) para validar que no hay conflicto. Si hay conflicto, responder 409.
3. Al crear exitosamente una reservación, insertar automáticamente un registro en `historial_cambios` con `accion = 'creacion'`.
4. Al crear exitosamente una reservación, insertar automáticamente una notificación en la tabla `notificaciones` para el usuario con `tipo = 'confirmacion'`.
5. En `PATCH /api/reservaciones/:id/cancelar`: verificar que la reservación pertenece al usuario autenticado (o que es admin). Si ya está cancelada, responder 400. Al cancelar, registrar en `historial_cambios` con `accion = 'cancelacion'` e insertar notificación con `tipo = 'cancelacion'`.
6. En `PUT /api/reservaciones/:id`: permitir modificar `fecha_inicio`, `fecha_fin` y `motivo`. Re-validar disponibilidad con las nuevas fechas antes de guardar. Registrar en `historial_cambios` con `accion = 'modificacion'`.
7. `GET /api/reservaciones`: si el usuario tiene rol `admin`, devolver todas las reservaciones; si es `usuario`, devolver solo las suyas.
8. `GET /api/reservaciones/:id`: validar que el usuario es dueño de la reservación o es admin antes de devolver el detalle.
9. Actualizar `backend/src/routes/reservaciones.js` si es necesario.
10. Documentar el flujo completo (crear → validar disponibilidad → confirmar → historial → notificación) con diagrama de texto y ejemplos de request/response en `docs/reservaciones.md`.

**Archivos a modificar:**
```
backend/src/controllers/reservacionesController.js
backend/src/routes/reservaciones.js
```

**Archivos a crear:**
```
docs/reservaciones.md
```

---

## Integrante 4 — Diego

**Rama:** `feature/frontend-espacios`  
**Módulo:** Frontend — vistas de espacios y disponibilidad  
**Descripción:** Construir las vistas de listado de espacios con filtros y el componente de consulta de disponibilidad por espacio y rango de fechas.

### Tareas

1. Completar `frontend/src/pages/Espacios.jsx`:
   - Listar todos los espacios consumiendo `GET /api/espacios`.
   - Agregar filtro por tipo de espacio (selector con los tipos de la BD).
   - Agregar filtro por estado (`disponible`, `mantenimiento`, `inactivo`).
   - Mostrar cada espacio usando el componente `EspacioCard.jsx`.
2. Crear `frontend/src/components/EspacioCard.jsx`:
   - Mostrar nombre, tipo, capacidad, ubicación y estado con badge de color.
   - Botón "Ver disponibilidad" que despliega el componente `DisponibilidadCalendario.jsx`.
3. Crear `frontend/src/components/FiltroEspacios.jsx`:
   - Dos selectores: tipo de espacio y estado.
   - Al cambiar los filtros, actualiza la lista en tiempo real (filtrado local sobre los datos ya cargados).
4. Crear `frontend/src/components/DisponibilidadCalendario.jsx`:
   - Inputs de fecha-hora inicio y fecha-hora fin.
   - Botón "Consultar" que llama a `POST /api/disponibilidad/verificar`.
   - Mostrar resultado: mensaje verde "Disponible" o mensaje rojo "No disponible" con detalle del conflicto.
5. Usar `frontend/src/api/axios.js` para todas las llamadas HTTP (ya está configurado con el token JWT).
6. Agregar capturas de pantalla de las vistas terminadas en `docs/screenshots/espacios/`.

**Archivos a modificar:**
```
frontend/src/pages/Espacios.jsx
```

**Archivos a crear:**
```
frontend/src/components/EspacioCard.jsx
frontend/src/components/FiltroEspacios.jsx
frontend/src/components/DisponibilidadCalendario.jsx
docs/screenshots/espacios/   ← carpeta con imágenes .png
```

---

## Integrante 5 — Cheluis

**Rama:** `feature/frontend-reservaciones`  
**Módulo:** Frontend — reservaciones y dashboard  
**Descripción:** Completar el formulario de nueva reservación, el historial de reservaciones del usuario, y mejorar el dashboard con estadísticas básicas.

### Tareas

1. Completar `frontend/src/pages/NuevaReservacion.jsx`:
   - Selector de espacio que carga la lista desde `GET /api/espacios`.
   - Inputs de fecha-hora inicio y fin.
   - Campo opcional de motivo.
   - Botón "Verificar disponibilidad" que consulta `POST /api/disponibilidad/verificar` antes de mostrar el botón de confirmar.
   - Mostrar mensaje de disponible/no disponible en tiempo real.
   - Al confirmar, enviar `POST /api/reservaciones` y redirigir a la lista de reservaciones.
   - Extraer el formulario al componente `FormularioReservacion.jsx`.
2. Completar `frontend/src/pages/Reservaciones.jsx`:
   - Mostrar historial de reservaciones del usuario usando `GET /api/reservaciones`.
   - Mostrar cada reservación con el componente `ReservacionCard.jsx`.
   - En reservaciones con estado `pendiente` o `confirmada`, mostrar botón "Cancelar" que llama a `PATCH /api/reservaciones/:id/cancelar` con confirmación previa.
   - Actualizar la lista automáticamente tras cancelar.
3. Crear `frontend/src/components/ReservacionCard.jsx`:
   - Mostrar espacio, fechas, motivo y estado con badge de color.
   - Badge: pendiente (amarillo), confirmada (verde), cancelada (gris), completada (azul).
4. Crear `frontend/src/components/FormularioReservacion.jsx`:
   - Extrae la lógica del formulario de `NuevaReservacion.jsx` en un componente reutilizable.
5. Mejorar `frontend/src/pages/Dashboard.jsx`:
   - Tarjeta con el total de reservaciones del usuario.
   - Tarjeta con reservaciones activas (pendiente + confirmada).
   - Tarjeta con notificaciones sin leer.
   - Acceso rápido a "Nueva Reservación" y "Ver mis reservaciones".
6. Agregar capturas de pantalla de las vistas terminadas en `docs/screenshots/reservaciones/`.

**Archivos a modificar:**
```
frontend/src/pages/NuevaReservacion.jsx
frontend/src/pages/Reservaciones.jsx
frontend/src/pages/Dashboard.jsx
```

**Archivos a crear:**
```
frontend/src/components/ReservacionCard.jsx
frontend/src/components/FormularioReservacion.jsx
docs/screenshots/reservaciones/   ← carpeta con imágenes .png
```

---

## Integrante 6 — Heber

**Rama:** `feature/notificaciones-bd`  
**Módulo:** Base de datos y notificaciones  
**Descripción:** Optimizar el esquema de la base de datos, enriquecer los seeds con datos más representativos y completar el módulo de notificaciones.

### Tareas

**Base de datos:**

1. Revisar `database/init.sql` y verificar que todos los índices necesarios estén creados (sobre `reservaciones.espacio_id`, `reservaciones.usuario_id`, `reservaciones.fecha_inicio`, `notificaciones.usuario_id`).
2. Verificar que los constraints `CHECK` estén bien definidos (ej: `fecha_fin > fecha_inicio` en reservaciones y horarios_bloqueados).
3. Ampliar `database/seeds.sql`:
   - Agregar al menos 5 reservaciones de ejemplo (en distintos estados: pendiente, confirmada, cancelada).
   - Agregar al menos 2 horarios bloqueados de ejemplo.
   - Agregar al menos 3 notificaciones de ejemplo ligadas a esas reservaciones.
   - Agregar recursos adicionales a los espacios existentes.
4. Documentar el schema completo de la BD en `docs/base-de-datos.md`: descripción de cada tabla, columnas, tipos, constraints y relaciones entre tablas.

**Módulo de notificaciones:**

5. Completar `backend/src/controllers/notificacionesController.js`:
   - `GET /api/notificaciones` — listar todas las notificaciones del usuario autenticado con detalle del espacio y fechas.
   - `PATCH /api/notificaciones/:id/leer` — marcar una notificación como leída, verificando que pertenece al usuario.
   - `GET /api/notificaciones/no-leidas` — contar y listar solo las notificaciones sin leer del usuario (útil para el badge del navbar).
6. Verificar que el controller maneja correctamente el caso de notificación no encontrada (404) y el de acceso a notificación de otro usuario (403).
7. Actualizar `backend/src/routes/notificaciones.js` con la ruta de no-leidas.

**Archivos a modificar:**
```
backend/src/controllers/notificacionesController.js
backend/src/routes/notificaciones.js
database/seeds.sql
```

**Archivos a crear:**
```
docs/base-de-datos.md
```

---

## Integrante 7 — Karla

**Rama:** `feature/docs-pruebas`  
**Módulo:** Pruebas Postman y documentación final  
**Descripción:** Probar todos los endpoints del sistema, documentar los casos de uso y consolidar la documentación de todos los integrantes en un solo archivo final.

### Tareas

**Pruebas con Postman:**

1. Crear una colección en Postman llamada `Sistema Reservaciones ITO` con carpetas por módulo: Auth, Espacios, Reservaciones, Disponibilidad, Notificaciones.
2. Por cada endpoint, agregar al menos dos casos:
   - Caso exitoso con datos válidos.
   - Caso de error (datos faltantes, token inválido, recurso no encontrado, conflicto de horario).
3. Configurar una variable de entorno en Postman llamada `{{base_url}}` con valor `http://localhost:3000` y `{{token}}` que se actualice automáticamente al hacer login.
4. Agregar un script en el request de login para guardar el token automáticamente:
   ```js
   const res = pm.response.json();
   pm.environment.set("token", res.token);
   ```
5. Exportar la colección como `POSTMAN_COLLECTION.json` y colocarla en la raíz del proyecto.

**Documentación final:**

6. Revisar los archivos `docs/disponibilidad.md`, `docs/espacios.md`, `docs/reservaciones.md` y `docs/base-de-datos.md` que escribió cada integrante.
7. Consolidar toda la documentación en un solo archivo `DOCUMENTACION.md` en la raíz del proyecto con:
   - Descripción general del sistema.
   - Arquitectura (diagrama de texto con las capas).
   - Documentación de cada módulo (endpoints con ejemplos).
   - Schema de la BD.
   - Guía de instalación (referencia al README.md).
8. Verificar que el proyecto completo levante sin errores después de integrar todos los módulos:
   - `npm run dev` en backend sin errores.
   - `npm run dev` en frontend sin errores de consola.
   - Todos los endpoints responden correctamente en Postman.
9. Anotar cualquier bug o inconsistencia encontrada y avisar al integrante correspondiente.

**Archivos a crear:**
```
POSTMAN_COLLECTION.json
DOCUMENTACION.md
```

---

## Documentación compartida — responsabilidad de cada integrante

Antes de que Karla consolide todo, **cada integrante debe documentar su propio módulo** creando o completando su archivo en la carpeta `docs/`:

| Integrante | Archivo a crear | Contenido |
|-----------|----------------|-----------|
| David | `docs/disponibilidad.md` | Endpoints con ejemplos de request y response en JSON |
| Isaac | `docs/espacios.md` | Endpoints con ejemplos de request y response en JSON |
| Alex | `docs/reservaciones.md` | Endpoints + diagrama del flujo crear → validar → confirmar → historial |
| Diego | `docs/screenshots/espacios/` | Capturas .png de las vistas de espacios y disponibilidad |
| Cheluis | `docs/screenshots/reservaciones/` | Capturas .png de reservaciones y dashboard |
| Heber | `docs/base-de-datos.md` | Descripción de cada tabla, columnas y relaciones |
| Karla | `DOCUMENTACION.md` | Consolidación de todos los anteriores + colección Postman |

---

## Nota de integración

**David es el encargado de integración y merge a main.**

Cuando un integrante termine su módulo y abra el Pull Request:
1. David lo revisa, lo prueba localmente y da el visto bueno.
2. David hace el merge a `main`.
3. Después del merge, el resto del equipo debe jalar los cambios: `git fetch origin && git merge origin/main`.

Si hay conflictos al mergear, resolverlos en coordinación con el integrante afectado — nunca resolver conflictos de otro solos.
