# Metodología de Trabajo — Kanban

**Proyecto:** Sistema de Reservaciones ITO  
**Equipo:** 7 integrantes  
**Herramienta:** GitHub Projects  
**Materia:** Desarrollo de Servicios Web — 8vo Semestre, ITO

---

## 1. Introducción

Kanban es una metodología ágil de gestión visual del trabajo. Su nombre viene del japonés y significa "tarjeta visual". La idea central es representar cada tarea como una tarjeta que avanza por columnas según su estado, permitiendo que todo el equipo vea en tiempo real qué se está haciendo, qué está bloqueado y qué ya terminó.

### Por qué elegimos Kanban para este proyecto

El equipo está formado por 7 personas trabajando en módulos independientes, con horarios académicos distintos y sin posibilidad de reunirse diariamente. Kanban encaja bien por las siguientes razones:

- **No requiere roles formales.** No hay Scrum Master ni Product Owner; cada integrante gestiona su propia tarjeta.
- **No hay sprints ni fechas fijas de iteración.** Cada módulo avanza a su propio ritmo sin presionar al resto del equipo.
- **Es fácil de adoptar.** El tablero está integrado directamente en GitHub, donde ya gestionamos el código.
- **Escala bien para entregas académicas.** Permite ver el progreso total del proyecto de un vistazo, útil tanto para el equipo como para presentarlo en clase.

---

## 2. Herramienta utilizada — GitHub Projects

El tablero Kanban del proyecto vive en **GitHub Projects**, integrado directamente con el repositorio. Esto permite:

- Vincular cada tarjeta con su Pull Request correspondiente.
- Mover automáticamente una tarjeta a **Done** cuando el PR se mergea a `main`.
- Ver el historial de cambios de cada tarjeta junto al historial de commits.
- Acceder al tablero sin herramientas externas — basta con tener acceso al repositorio.

Para acceder: repositorio en GitHub → pestaña **Projects** → _Sistema Reservaciones ITO_.

---

## 3. Tablero Kanban — columnas

El tablero tiene 4 columnas. Cada tarjeta representa el módulo de un integrante y solo puede estar en una columna a la vez.

| Columna | Significado | Quién mueve la tarjeta |
|---------|-------------|----------------------|
| **Todo** | Tarea pendiente de iniciar. El integrante aún no ha comenzado su módulo | El integrante, al arrancar |
| **In Progress** | El integrante está desarrollando activamente su módulo en su rama `feature/` | El integrante, al empezar |
| **In Review** | El módulo está terminado, el PR fue abierto y está esperando revisión y merge por parte de David | El integrante, al abrir el PR |
| **Done** | El PR fue aprobado, mergeado a `main` y el módulo está integrado en el proyecto | David, al hacer el merge |

### Estado actual del tablero

| # Tarjeta | Integrante | Módulo | Estado |
|-----------|-----------|--------|--------|
| #4 | David | Módulo de disponibilidad | **Done** |
| #5 | Isaac | Módulo de espacios (backend) | Todo |
| #3 | Alex | Módulo de reservaciones (backend) | **Done** |
| #6 | Diego | Frontend — espacios y disponibilidad | Todo |
| #7 | Cheluis | Frontend — reservaciones y dashboard | Todo |
| #8 | Heber | Base de datos y notificaciones | Todo |
| #9 | Karla | Pruebas Postman y documentación final | Todo |

---

## 4. Principios Kanban aplicados en el proyecto

### Visualización del flujo de trabajo

Todas las tareas están representadas en el tablero. Cualquier integrante puede abrir GitHub Projects y saber en segundos qué módulos están en desarrollo, cuáles esperan revisión y cuáles ya están integrados. No hace falta preguntar por WhatsApp el estado de cada parte.

### Límite de trabajo en progreso (WIP limit)

Cada integrante tiene **máximo 2 tarjetas en In Progress** al mismo tiempo. En la práctica, como cada quien tiene un solo módulo asignado, esto significa que no se empieza una tarea nueva sin terminar la anterior. Esto evita el trabajo disperso y las integraciones incompletas.

### Flujo continuo sin sprints

No hay fechas de entrega por iteración ni reuniones de planificación de sprint. Cada módulo avanza de forma independiente. Cuando un integrante termina, abre su PR sin esperar a que los demás terminen. Esto permite que David integre los módulos listos a `main` de forma progresiva.

### Mejora continua y visibilidad en tiempo real

El tablero refleja el estado real del proyecto en todo momento. Si una tarjeta lleva varios días en **In Progress** sin moverse, es una señal visible para el equipo de que algo puede estar bloqueado. Cualquier integrante puede ofrecer ayuda o David puede coordinar sin necesidad de una reunión formal.

---

## 5. Flujo de trabajo del equipo — paso a paso

Este es el camino que sigue cada tarjeta desde que se crea hasta que se completa:

```
TODO  ──►  IN PROGRESS  ──►  IN REVIEW  ──►  DONE
```

### Paso 1 — Iniciar el módulo

El integrante mueve su tarjeta de **Todo** a **In Progress** y crea su rama local:

```bash
git checkout main
git pull origin main
git checkout -b feature/su-modulo
```

### Paso 2 — Desarrollar y hacer commits frecuentes

El integrante trabaja en su rama haciendo commits descriptivos en español:

```bash
git add src/controllers/miController.js
git commit -m "agrega validación de fechas en el módulo de reservaciones"
git push origin feature/su-modulo
```

### Paso 3 — Terminar y abrir Pull Request

Cuando el módulo está completo y probado, el integrante:

1. Sube su rama al repositorio remoto: `git push origin feature/su-modulo`
2. Abre un Pull Request en GitHub hacia `main`
3. Mueve su tarjeta de **In Progress** a **In Review**
4. Avisa a David que el PR está listo para revisión

### Paso 4 — Revisión por David

David revisa el PR:
- Prueba el módulo localmente haciendo checkout de la rama
- Verifica que los endpoints respondan correctamente
- Revisa que no haya conflictos con `main`
- Si hay correcciones, las comenta en el PR y la tarjeta permanece en **In Review**
- Si todo está bien, aprueba el PR y hace el merge a `main`

### Paso 5 — Merge y cierre

Una vez mergeado:
- David mueve la tarjeta a **Done** (o GitHub lo hace automáticamente si está vinculado el PR)
- El resto del equipo actualiza su rama local:

```bash
git fetch origin
git merge origin/main
```

---

## 6. Ventajas de Kanban sobre Scrum para este proyecto

Scrum es una metodología poderosa, pero impone una estructura que no se adapta bien al contexto académico de este equipo:

| Aspecto | Scrum | Kanban (lo que usamos) |
|---------|-------|----------------------|
| Reuniones | Daily standup, sprint planning, revisión, retrospectiva | Ninguna obligatoria |
| Roles formales | Scrum Master, Product Owner, Development Team | No hay roles especiales |
| Ciclos de entrega | Sprints de 1-4 semanas con fechas fijas | Flujo continuo, sin fechas de iteración |
| Velocidad del equipo | Se mide en story points por sprint | No aplica; cada módulo avanza a su ritmo |
| Ideal para | Equipos dedicados a tiempo completo con horarios alineados | Equipos con horarios distintos y tareas independientes |
| Adaptación al equipo | Requiere disciplina en las ceremonias | Se adapta a la disponibilidad de cada integrante |

En un equipo académico donde cada persona tiene materias, trabajos y horarios distintos, exigir un daily standup diario o un sprint planning semanal generaría fricción sin agregar valor real. Kanban nos da la estructura suficiente para coordinar el trabajo sin imponer una carga de proceso que no podemos sostener.

---

## 7. Referencia rápida para el equipo

```
¿Qué hago cuando...?

Voy a empezar mi módulo   →  Muevo mi tarjeta a In Progress + creo mi rama
Terminé mi módulo         →  Abro PR + muevo tarjeta a In Review + aviso a David
David mergeó mi PR        →  Tarjeta pasa a Done + jaló cambios de main
Veo una tarjeta atascada  →  Ofrezco ayuda o lo menciono al equipo
```
