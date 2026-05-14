# Corrección de Endpoint de Reservaciones para Usuarios

## Descripción del bug
En la lista de reservaciones (`Reservaciones.jsx`), los usuarios con rol normal recibían un error **403 Forbidden** al intentar ver sus reservaciones. Esto sucedía porque el frontend intentaba consumir el endpoint de administrador para todos los roles.

## Causa raíz
En la línea que determina la URL a consumir para cargar las reservaciones, se utilizaba una condición ternaria donde ambos resultados apuntaban al mismo endpoint `/reservaciones`, el cual está protegido por el middleware `authAdmin`:
```javascript
const url = usuario?.rol === 'admin' ? '/reservaciones' : '/reservaciones';
```

## Solución aplicada
Se corrigió la condición para que los usuarios sin permisos de administrador utilicen su endpoint correspondiente (`/reservaciones/mis-reservaciones`):

**Antes:**
```javascript
const url = usuario?.rol === 'admin' ? '/reservaciones' : '/reservaciones';
```

**Después:**
```javascript
const url = usuario?.rol === 'admin' ? '/reservaciones' : '/reservaciones/mis-reservaciones';
```

## Tabla de endpoints por rol

| Rol | Endpoint correcto | Middleware |
|-----|------------------|-----------|
| `admin` | `GET /api/reservaciones` | `authAdmin` — devuelve todas |
| `usuario` | `GET /api/reservaciones/mis-reservaciones` | `auth` — devuelve solo las del usuario |
