# DOCUMENTACIÓN DEL MÓDULO DE ESPACIOS

**Responsable:** Isaac  
**Proyecto:** Sistema de Reservaciones ITO  
**Rama:** feature/modulo-espacios  

---

##  DESCRIPCIÓN GENERAL

El módulo de espacios permite la gestión de los recursos físicos del instituto (aulas, laboratorios y auditorios).  
Incluye operaciones de consulta de espacios disponibles.

---

##  AUTENTICACIÓN

Todos los endpoints requieren token JWT:

Authorization: Bearer <token>

---

## BASE URL

http://localhost:3000/api/espacios

---

##  ENDPOINTS DEL MÓDULO

---

## 1. GET /api/espacios

Descripción:  
Obtiene todos los espacios registrados con su tipo.

---

## REQUEST

GET /api/espacios  
Authorization: Bearer <token>

---

## RESPONSE (200 OK)

[
  {
    "id": 5,
    "nombre": "Auditorio Principal",
    "capacidad": 200,
    "ubicacion": "Edificio Central",
    "estado": "disponible",
    "tipo_espacio_id": 3,
    "tipo_nombre": "Auditorio"
  },
  {
    "id": 1,
    "nombre": "Aula 101",
    "capacidad": 35,
    "ubicacion": "Edificio A, Planta Baja",
    "estado": "disponible",
    "tipo_espacio_id": 1,
    "tipo_nombre": "Aula"
  },
  {
    "id": 2,
    "nombre": "Aula 201",
    "capacidad": 40,
    "ubicacion": "Edificio A, Segundo Piso",
    "estado": "disponible",
    "tipo_espacio_id": 1,
    "tipo_nombre": "Aula"
  },
  {
    "id": 3,
    "nombre": "Lab Computo 1",
    "capacidad": 30,
    "ubicacion": "Edificio B, Planta Baja",
    "estado": "disponible",
    "tipo_espacio_id": 2,
    "tipo_nombre": "Laboratorio"
  },
  {
    "id": 4,
    "nombre": "Lab Redes",
    "capacidad": 25,
    "ubicacion": "Edificio B, Primer Piso",
    "estado": "disponible",
    "tipo_espacio_id": 2,
    "tipo_nombre": "Laboratorio"
  }
]

---

## 2. GET /api/espacios/tipos

Descripción:  
Devuelve la lista de todos los tipos de espacio registrados en el sistema. Lo usan los formularios de crear y editar espacio para poblar el selector de tipo.

---

## REQUEST

GET /api/espacios/tipos  
Authorization: Bearer <token>

---

## RESPONSE (200 OK)

```json
[
  { "id": 1, "nombre": "Aula", "descripcion": "Sala de clases estándar" },
  { "id": 2, "nombre": "Laboratorio", "descripcion": "Laboratorio equipado con equipo de cómputo" },
  { "id": 3, "nombre": "Auditorio", "descripcion": "Sala de eventos y conferencias" }
]
```

---

## 3. GET /api/espacios/:id

Descripción:  
Obtiene la información detallada de un espacio específico por su ID.

---

## REQUEST

GET /api/espacios/1  
Authorization: Bearer <token>

---

## RESPONSE (200 OK)

{
  "id": 1,
  "nombre": "Aula 101",
  "capacidad": 35,
  "ubicacion": "Edificio A, Planta Baja",
  "estado": "disponible",
  "tipo_espacio_id": 1,
  "tipo_nombre": "Aula",
  "recursos": [
    {
      "id": 1,
      "nombre": "Proyector",
      "descripcion": "Proyector EPSON full HD"
    },
    {
      "id": 2,
      "nombre": "Pizarrón",
      "descripcion": "Pizarrón blanco con marcadores"
    }
  ]
}

---

## 3. POST /api/espacios

Descripción:  
Se agrega un nuevo espacio

---

## REQUEST

POST /api/espacios  
Authorization: Bearer <token>

```json
{
  "nombre": "Aula 303",
  "capacidad": 50,
  "ubicacion": "Edificio B, Segundo Piso",
  "estado": "disponible",
  "tipo_espacio_id": 1
}
```

---

## RESPONSE (201 CREATED)

{
  "id": 8,
  "nombre": "Aula 303",
  "capacidad": 50,
  "ubicacion": "Edificio B, Segundo Piso",
  "estado": "disponible",
  "tipo_espacio_id": 1
}

---

## 4. PUT /api/espacios/:id

Descripción:  
Actualiza la información de un espacio existente.  
Permite actualizar uno o varios campos.

---

## REQUEST

PUT /api/espacios/1  
Authorization: Bearer <token>

```json
{
  "nombre": "Aula Modificada",
  "capacidad": 55,
  "ubicacion": "Edificio A",
  "estado": "disponible",
  "tipo_espacio_id": 1
}
```

---

## RESPONSE (200 OK)

{
  "id": 1,
  "nombre": "Aula Modificada",
  "capacidad": 55,
  "ubicacion": "Edificio A",
  "estado": "disponible",
  "tipo_espacio_id": 1
}

---

## ERROR (404 NOT FOUND)

{
  "error": "Espacio no encontrado"
}

---

## 5. DELETE /api/espacios/:id

Descripción:  
Elimina un espacio del sistema.

---

## REQUEST

DELETE /api/espacios/1  
Authorization: Bearer <token>

---

## RESPONSE

{
  "mensaje": "Espacio eliminado correctamente"
}

---

##  EVIDENCIA DE PRUEBA

GET /api/espacios/  
Estado: 200 OK  
Evidencia: screenshots\espacios-get-exitoso.png  

GET /api/espacios/1  
Estado: 200 OK  
Evidencia: screenshots\espacios-get-conid.png  

POST /api/espacios  
Estado: 201 CREATED  
Evidencia: screenshots\espacios-post-exitoso.png  

PUT /api/espacios/:id  
Estado: 200 OK  
Evidencia: screenshots\espacios-put-exitoso.png  

DELETE /api/espacios/1  
Estado: 200 OK  
Evidencia: screenshots\espacios-delete-exitoso.png  