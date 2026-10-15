# Contract: CLI (interfaz externa de task-cli)

**Feature**: 001-personal-task-cli | **Date**: 2026-10-15
**Consumidor**: usuario humano en terminal. La CLI es la única interfaz del
producto (sin API ni librería pública).

## Convenciones globales

- Binario: `task` (instalable con `npm install -g`).
- Códigos de salida: `0` éxito, `1` cualquier error (FR-014).
- Errores: mensaje claro en español a stderr; **nunca** stack traces (FR-013).
- Valores enumerados en inglés (`high|medium|low`, `todo|in-progress|done`);
  mensajes al usuario en español.
- Sin TTY + operación destructiva sin `--force` → error accionable (no colgar).

## Comandos

### `task add <title>`

Crea una tarea (FR-001, FR-002, FR-003).

| Elemento | Regla |
| --- | --- |
| `<title>` | Obligatorio; no vacío ni solo espacios |
| `--priority <high\|medium\|low>` | Opcional; default `medium` |
| `--description <text>` | Opcional |

- Éxito: imprime confirmación con el ID asignado; estado inicial `todo`.
- Errores: título vacío; prioridad fuera del conjunto → lista los valores válidos.

### `task list`

Lista tareas en tabla: ID, título, estado, prioridad, fecha de creación;
orden `created_at DESC` (FR-004, FR-005).

| Flag | Regla |
| --- | --- |
| `--status <todo\|in-progress\|done>` | Filtra por estado |
| `--priority <high\|medium\|low>` | Filtra por prioridad |

- Filtros combinados con semántica "Y" (supuesto del spec).
- Sin resultados: mensaje amigable, no tabla vacía (edge case).

### `task start <id>`

Transición `todo → in-progress`. Errores: id inexistente; estado actual no
permite la transición (mensaje indica la razón).

### `task done <id>`

Transición `in-progress → done`. En particular rechaza `todo → done` explicando
que debe pasar primero por `in-progress` (FR-008, SC-003).

### `task todo <id>`

Transición `in-progress → todo` (devolver al backlog).

### `task reopen <id>`

Transición `done → todo` (reabrir).

### `task update <id>`

Actualiza campos de una tarea existente (FR-009).

| Flag | Regla |
| --- | --- |
| `--title <text>` | Opcional; si se pasa, no vacío |
| `--description <text>` | Opcional |
| `--priority <high\|medium\|low>` | Opcional |

- Debe indicarse al menos un campo; ninguno → error (edge case).
- No modifica `status` ni `created_at`.
- Errores: id inexistente; prioridad inválida.

### `task delete <id>`

Elimina una tarea (FR-010).

| Flag | Regla |
| --- | --- |
| `--force` | Omite la confirmación |

- Sin `--force`: pide confirmación; respuesta negativa → no borra, exit 0
  (operación cancelada sin error) o exit 1 según decisión de implementación —
  el spec solo exige que la tarea permanezca intacta.
- Errores: id inexistente; stdin no interactivo sin `--force`.

## Entidades del contrato

Ver [data-model.md](./data-model.md) para la entidad Tarea y su máquina de
estados; este contrato no expone campos internos más allá de la tabla de listado.
