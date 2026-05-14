her# Gestión de Espacios — CRUD

## Descripción
Este documento describe las funcionalidades implementadas en `GestionEspacios.jsx` para el módulo de administración de espacios. Los botones de "Agregar", "Editar" y "Eliminar" existían visualmente pero no tenían funcionalidad — solo imprimían en consola. Se completó la implementación de las tres acciones.

## Funcionalidades agregadas

### Crear espacio
Al hacer clic en "Agregar nuevo espacio" se abre un modal con un formulario. Al guardar, se envía al backend y el nuevo espacio aparece en la tabla sin recargar la página.

### Editar espacio
Al hacer clic en el ícono de editar, se abre un modal con los datos del espacio pre-llenados. Se puede modificar nombre, capacidad, ubicación, estado y tipo. Al guardar, la tabla se actualiza automáticamente.

### Eliminar espacio
Al hacer clic en el ícono de eliminar, se muestra una confirmación. Si se acepta, el espacio se elimina del backend y desaparece de la tabla sin recargar la página.

## Endpoints utilizados

| Acción | Método | Endpoint | Body requerido |
|---|---|---|---|
| Crear | POST | /api/espacios | `{ nombre, capacidad, ubicacion, tipo_espacio_id }` |
| Editar | PUT | /api/espacios/:id | `{ nombre, capacidad, ubicacion, estado, tipo_espacio_id }` |
| Eliminar | DELETE | /api/espacios/:id | — |

### Respuesta exitosa — Crear (201)
```json
{
  "id": 6,
  "nombre": "Aula 301",
  "capacidad": 30,
  "ubicacion": "Edificio C",
  "estado": "disponible",
  "tipo_espacio_id": 1
}
```

### Respuesta exitosa — Editar (200)
```json
{
  "id": 1,
  "nombre": "Aula 101 actualizada",
  "capacidad": 40,
  "ubicacion": "Edificio A",
  "estado": "mantenimiento",
  "tipo_espacio_id": 1
}
```

### Errores posibles
| Código | Descripción |
|---|---|
| 400 | Faltan campos obligatorios o capacidad fuera de rango |
| 404 | Espacio no encontrado |
| 409 | No se puede eliminar: tiene reservaciones activas |

## Validaciones del backend
- `nombre` y `tipo_espacio_id` son obligatorios
- `capacidad` debe ser un número entre 1 y 500
- No se puede eliminar un espacio que tenga reservaciones activas (el backend responde 409)