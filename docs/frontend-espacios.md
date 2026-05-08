# Módulo de Espacios (Frontend)

Este documento describe la implementación del módulo de Espacios en el Frontend, correspondiente a la vista de listado y consulta de disponibilidad de los espacios del Instituto.

## Rutas y Vistas

- **Página Principal:** `/espacios`
- **Archivo Principal:** `frontend/src/pages/Espacios.jsx`

La vista principal está encargada de orquestar el flujo de datos. Consume la API (`GET /api/espacios`) para obtener la lista completa y gestiona de manera local (del lado del cliente) los filtros aplicados por el usuario.

## Componentes Desarrollados

### 1. FiltroEspacios
**Archivo:** `frontend/src/components/FiltroEspacios.jsx`

Componente encargado de proporcionar las opciones de filtrado interactivo.
- **Búsqueda por texto:** Filtra en tiempo real comparando con el nombre o ubicación del espacio.
- **Selector de Tipos:** Se puebla dinámicamente extrayendo los tipos únicos (`tipo_nombre`) directamente del arreglo de espacios devuelto por el servidor.
- **Selector de Estado:** Filtra por estados estáticos predefinidos: *Disponible*, *En mantenimiento*, *Inactivo*.

### 2. EspacioCard
**Archivo:** `frontend/src/components/EspacioCard.jsx`

Componente de presentación (UI) para un espacio individual.
- **Información:** Muestra el nombre, categoría, capacidad, ubicación y un *badge* dinámico que cambia de color según el estado del espacio.
- **Iconografía:** Utiliza SVG integrados nativamente para mantener un estilo "Premium" sin depender de librerías externas.
- **Roles y Accesos (useAuth):**
  - **Todos los usuarios:** Pueden ver la tarjeta y hacer clic en "Ver disponibilidad" y "Reservar".
  - **Administrador (`rol === 'admin'`):** Visualiza los botones adicionales de "Editar" y "Eliminar".

### 3. DisponibilidadCalendario
**Archivo:** `frontend/src/components/DisponibilidadCalendario.jsx`

Componente modal flotante para verificar en tiempo real si un espacio puede ser reservado en un marco de tiempo específico.
- **Entradas:** `Fecha y hora de inicio` y `Fecha y hora de fin` usando inputs nativos `datetime-local`.
- **Validación Frontend:** Verifica que ambas fechas sean proporcionadas y que la fecha de inicio sea estrictamente anterior a la de fin antes de enviar la petición.
- **Conexión a API:** Dispara una solicitud POST a `/api/disponibilidad/verificar` con la estructura `{ espacioId, fecha_inicio, fecha_fin }`.
- **Resultados:** 
  - Si está disponible, muestra un recuadro verde confirmando la disponibilidad.
  - Si hay conflictos (reservaciones previas o bloqueos administrativos), muestra un recuadro rojo especificando la razón (por ejemplo, mostrando el número de reservaciones cruzadas).

## Flujo de Trabajo y Estilos

- **Estilos en línea:** Se implementaron los estilos visuales principales utilizando estilos en línea (inline-styles) y SVG para los iconos, acoplándose al diseño esperado sin añadir dependencias pesadas de CSS o de iconos.
- **Diseño unificado:** Se validó que el componente funcionara perfectamente integrándose con los componentes `Sidebar` y `Layout` del diseño principal de la aplicación.
- **Control de Roles:** Se hizo uso extensivo de `useAuth()` extraído del contexto global de la aplicación para esconder lógicas administrativas y mantener la experiencia limpia para el estudiante o profesor regular.

## Capturas de Pantalla

*(Se adjuntarán las imágenes en el directorio `docs/screenshots/espacios/` para mostrar visualmente los resultados finales tanto en la vista estándar como al abrir el modal de disponibilidad).*
