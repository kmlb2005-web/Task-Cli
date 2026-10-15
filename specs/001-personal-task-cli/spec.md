# Feature Specification: task-cli (Gestión de Tareas Personales)

**Feature Branch**: `001-personal-task-cli`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "Construir un CLI llamado 'task-cli' para gestión de tareas personales desde la terminal. Incluye crear, listar, cambiar estado, actualizar y eliminar tareas, con prioridades y filtrado."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear una tarea (Priority: P1)

Un usuario registra una nueva tarea escribiendo un comando con un título obligatorio.
Opcionalmente puede indicar una prioridad (high, medium, low) y una descripción. La
tarea se guarda con un identificador numérico único y nace siempre en estado "todo".

**Why this priority**: Sin la capacidad de registrar tareas no existe el producto;
es la función de la que dependen todas las demás.

**Independent Test**: Puede probarse completamente creando una tarea con solo título
y verificando que queda registrada con prioridad media y estado "todo".

**Acceptance Scenarios**:

1. **Given** no hay tareas registradas, **When** el usuario crea una tarea con título
   "Comprar pan", **Then** la tarea queda registrada con un ID numérico, prioridad
   "medium" y estado "todo".
2. **Given** existe una tarea, **When** el usuario crea una tarea con título "Deploy"
   y prioridad "high", **Then** la tarea queda registrada con prioridad "high".
3. **Given** el sistema, **When** el usuario intenta crear una tarea sin título,
   **Then** se muestra un mensaje claro indicando que el título es obligatorio y no
   se registra ninguna tarea.
4. **Given** el sistema, **When** el usuario crea una tarea con título y descripción,
   **Then** la descripción queda asociada a la tarea creada.

---

### User Story 2 - Listar y filtrar tareas (Priority: P2)

El usuario consulta sus tareas en una tabla legible que muestra ID, título, estado,
prioridad y fecha de creación, ordenadas por fecha (las más recientes primero). Puede
filtrar el listado por estado y/o por prioridad.

**Why this priority**: La visualización es el complemento natural de la creación;
sin ella el usuario no puede consultar lo que registró.

**Independent Test**: Puede probarse creando varias tareas y verificando que el
listado las muestra en tabla con el orden y los filtros solicitados.

**Acceptance Scenarios**:

1. **Given** existen tareas registradas, **When** el usuario lista las tareas,
   **Then** ve una tabla con las columnas ID, título, estado, prioridad y fecha de
   creación, ordenadas de más reciente a más antigua.
2. **Given** existen tareas en distintos estados, **When** el usuario filtra por
   estado "done", **Then** solo se muestran las tareas completadas.
3. **Given** existen tareas con distintas prioridades, **When** el usuario filtra por
   prioridad "high", **Then** solo se muestran las tareas de prioridad alta.
4. **Given** existen tareas, **When** el usuario aplica filtro de estado y de
   prioridad a la vez, **Then** se muestran solo las tareas que cumplen ambas
   condiciones.
5. **Given** no hay tareas que cumplan el filtro, **When** el usuario lista con ese
   filtro, **Then** ve un mensaje claro de que no hay resultados.

---

### User Story 3 - Cambiar el estado de una tarea (Priority: P3)

El usuario avanza o retrocede una tarea por su ID siguiendo una máquina de estados:
solo se permiten "todo → in-progress", "in-progress → done", "in-progress → todo" y
"done → todo". El salto directo "todo → done" está prohibido.

**Why this priority**: El seguimiento del progreso es el valor diferencial de la
gestión de tareas, pero requiere que las tareas ya existan.

**Independent Test**: Puede probarse cambiando el estado de una tarea existente y
verificando tanto las transiciones permitidas como las rechazadas.

**Acceptance Scenarios**:

1. **Given** una tarea en estado "todo", **When** el usuario la pasa a "in-progress",
   **Then** la tarea queda en estado "in-progress".
2. **Given** una tarea en estado "in-progress", **When** el usuario la pasa a "done",
   **Then** la tarea queda en estado "done".
3. **Given** una tarea en estado "in-progress", **When** el usuario la devuelve a
   "todo", **Then** la tarea queda en estado "todo".
4. **Given** una tarea en estado "done", **When** el usuario la reabre a "todo",
   **Then** la tarea queda en estado "todo".
5. **Given** una tarea en estado "todo", **When** el usuario intenta pasarla
   directamente a "done", **Then** se rechaza la operación con un mensaje que explica
   que debe pasar primero por "in-progress".
6. **Given** una tarea en estado "done", **When** el usuario intenta pasarla a
   "in-progress", **Then** se rechaza la operación con un mensaje claro.

---

### User Story 4 - Actualizar una tarea (Priority: P4)

El usuario modifica el título, la descripción o la prioridad de una tarea existente
identificada por su ID, sin afectar su estado ni su fecha de creación.

**Why this priority**: Corregir datos es importante pero menos crítico que crear,
consultar y progresar tareas; puede posponerse sin bloquear el uso básico.

**Independent Test**: Puede probarse actualizando el título de una tarea y
verificando que el resto de sus atributos quedan intactos.

**Acceptance Scenarios**:

1. **Given** una tarea con título "Tarea vieja", **When** el usuario cambia su
   título a "Tarea nueva", **Then** el título queda actualizado y los demás
   atributos no cambian.
2. **Given** una tarea existente, **When** el usuario cambia su prioridad a "low",
   **Then** la prioridad queda actualizada.
3. **Given** una tarea existente, **When** el usuario actualiza título y prioridad a
   la vez, **Then** ambos cambios se aplican en la misma operación.
4. **Given** una tarea en estado "in-progress", **When** el usuario actualiza su
   descripción, **Then** el estado permanece "in-progress".

---

### User Story 5 - Eliminar una tarea (Priority: P5)

El usuario elimina una tarea por su ID. El sistema pide confirmación antes de borrar
de forma permanente, y ofrece omitir esa confirmación con una bandera `--force`.

**Why this priority**: La eliminación es útil pero destructiva y menos frecuente;
no bloquea el flujo principal de trabajo.

**Independent Test**: Puede probarse intentando eliminar una tarea y verificando que
la confirmación se solicita y que la tarea desaparece solo tras confirmar.

**Acceptance Scenarios**:

1. **Given** una tarea existe, **When** el usuario solicita eliminarla, **Then** se
   pide confirmación antes de borrar.
2. **Given** se solicitó eliminar una tarea, **When** el usuario confirma,
   **Then** la tarea deja de existir y no aparece en listados posteriores.
3. **Given** se solicitó eliminar una tarea, **When** el usuario cancela,
   **Then** la tarea permanece intacta.
4. **Given** una tarea existe, **When** el usuario la elimina con la bandera de
   omisión de confirmación, **Then** la tarea se elimina sin preguntar.

---

### Edge Cases

- ¿Qué ocurre cuando se referencia un ID inexistente en cambio de estado,
  actualización o eliminación? → Se muestra un mensaje claro indicando que la tarea
  no existe, y la operación falla sin modificar nada.
- ¿Qué ocurre cuando se crea una tarea con un título vacío o solo en blanco? → Se
  rechaza con un mensaje de que el título es obligatorio.
- ¿Qué ocurre cuando se pasa un valor de estado o prioridad no válido? → Se rechaza
  con un mensaje que lista los valores aceptados.
- ¿Qué ocurre al listar con un filtro que no devuelve resultados? → Se muestra un
  mensaje amigable, no una tabla vacía sin contexto.
- ¿Qué ocurre al actualizar una tarea sin indicar ningún campo a modificar? → Se
  rechaza con un mensaje que indica al menos uno de título, descripción o prioridad.
- ¿Qué ocurre si dos operaciones se ejecutan simultáneamente sobre la misma tarea?
  → Cada operación se aplica de forma atómica; la última escritura gana sin corromper
  los datos.
- ¿Qué ocurre tras eliminar la tarea con el ID más alto? → Los IDs siguientes siguen
  siendo únicos; los IDs eliminados no se reutilizan.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir crear una tarea con un título obligatorio,
  y descripción y prioridad opcionales.
- **FR-002**: Al crear una tarea, el sistema MUST asignarle un identificador numérico
  único e incremental y el estado inicial "todo".
- **FR-003**: El sistema MUST aceptar únicamente las prioridades "high", "medium" y
  "low", usando "medium" por defecto cuando no se indique otra.
- **FR-004**: El sistema MUST listar las tareas en formato tabla mostrando ID,
  título, estado, prioridad y fecha de creación.
- **FR-005**: El listado MUST ordenarse por fecha de creación con las tareas más
  recientes primero por defecto.
- **FR-006**: El sistema MUST permitir filtrar el listado por estado
  (todo|in-progress|done) y por prioridad (high|medium|low), de forma independiente
  y combinada.
- **FR-007**: El sistema MUST mantener los estados "todo", "in-progress" y "done",
  y permitir únicamente las transiciones: todo→in-progress, in-progress→done,
  in-progress→todo y done→todo.
- **FR-008**: El sistema MUST rechazar cualquier transición no permitida — en
  especial todo→done — con un mensaje claro que indique la razón.
- **FR-009**: El sistema MUST permitir actualizar el título, la descripción o la
  prioridad de una tarea existente por su ID, sin alterar su estado ni su fecha de
  creación.
- **FR-010**: El sistema MUST permitir eliminar una tarea por su ID, solicitando
  confirmación previa salvo que se pida omitirla explícitamente.
- **FR-011**: Toda operación sobre una tarea inexistente MUST fallar con un mensaje
  claro y no modificar ningún dato.
- **FR-012**: El sistema MUST persistir las tareas de forma que sobrevivan al cierre
  y la reapertura de la herramienta.
- **FR-013**: Toda la salida de la herramienta MUST ser legible en terminal: los
  listados en tabla, los errores como mensajes claros y accionables, y nunca como
  trazas técnicas internas.
- **FR-014**: El sistema MUST comunicar el éxito o el fallo de cada operación con
  el código de salida correspondiente (0 éxito, 1 error).
- **FR-015**: El sistema MUST poder usarse como una herramienta instalable
  globalmente en la máquina del usuario.

### Key Entities

- **Tarea**: Representa un trabajo personal pendiente. Atributos: identificador
  numérico único (asignado automáticamente), título (obligatorio), descripción
  (opcional), prioridad (high|medium|low, por defecto medium), estado
  (todo|in-progress|done, por defecto todo) y fecha de creación (asignada
  automáticamente). No tiene due dates, subtareas, dependencias, tags ni
  pertenencia a usuarios en esta versión.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede crear una tarea y verla confirmada en menos de
  10 segundos desde que escribe el comando.
- **SC-002**: El listado de hasta 500 tareas se muestra completo en menos de
  1 segundo.
- **SC-003**: El 100% de las transiciones de estado no permitidas (incluido
  todo→done) son rechazadas con un mensaje comprensible, y ninguna deja la tarea
  en un estado inválido.
- **SC-004**: Tras 100 operaciones de creación, actualización y borrado, el 100%
  de los datos mostrados en el listado es consistente con las operaciones
  realizadas (sin pérdida ni duplicados de IDs).
- **SC-005**: Un usuario nuevo logra completar el ciclo crear → listar → avanzar de
  estado → eliminar sin consultar documentación externa, en un 90% de los casos de
  prueba.
- **SC-006**: Ningún fallo operativo (tarea inexistente, transición inválida,
  entrada vacía) muestra información técnica interna al usuario en el 100% de los
  casos.

## Assumptions

- La herramienta es de uso individual en la máquina local; no hay usuarios,
  autenticación ni concurrencia multiusuario que preveer.
- Los datos se guardan localmente en la máquina del usuario y no se sincronizan con
  ningún servicio externo.
- La fecha de creación se registra en el momento de crear la tarea y no se modifica
  nunca; no hay fechas de vencimiento en esta versión.
- Los filtros de estado y prioridad se combinan con semántica "Y" (deben cumplirse
  ambos).
- Los IDs eliminados no se reutilizan para tareas futuras.
- Los nombres de comando y banderas en inglés (por ejemplo `--status`, `--priority`,
  `--force`) son aceptables aunque la documentación y mensajes estén en español.
- Los mensajes al usuario se redactan en español, coherente con la documentación
  del proyecto.
- Fuera de alcance en esta versión (confirmado por el input): usuarios y
  autenticación, sincronización externa, fechas de vencimiento, subtareas y
  dependencias, tags y categorías, e interfaz web o API REST.
