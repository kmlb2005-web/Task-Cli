# Research: task-cli

**Feature**: 001-personal-task-cli | **Date**: 2026-10-15
**Relación**: soporta [plan.md](./plan.md); resuelve todas las decisiones técnicas
pendientes del plan (sin "NEEDS CLARIFICATION" restantes).

## Decisión 1: Formato y zona horaria de la fecha de creación

- **Decisión**: almacenar en UTC en formato ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`);
  presentar en la tabla en formato local corto (`YYYY-MM-DD HH:mm`).
- **Rationale**: ISO 8601 ordena lexicográficamente (cubre `ORDER BY created_at
  DESC` de SC-002/FR-005 sin funciones de fecha) y es inmutable e inofensivo.
- **Alternativas consideradas**: timestamp epoch (ilegible, requiere formateo en
  todo sitio); guardar en zona local (ambiguo al cambiar de equipo/zona).

## Decisión 2: IDs incrementales no reutilizados

- **Decisión**: `INTEGER PRIMARY KEY AUTOINCREMENT` en SQLite.
- **Rationale**: la cláusula `AUTOINCREMENT` (a diferencia del rowid implícito)
  garantiza que los IDs borrados no se reutilizan — requerimiento explícito del
  edge case del spec y del criterio SC-004.
- **Alternativas consideradas**: rowid implícito (reutiliza IDs tras borrar el
  máximo — viola el spec); UUIDs (sobrediseñado para uso personal local).

## Decisión 3: Representación de la máquina de estados

- **Decisión**: mapa puro `Record<Status, Status[]>` en `utils/state-machine.ts`
  como única fuente de verdad:
  `todo → [in-progress]`, `in-progress → [done, todo]`, `done → [todo]`.
- **Rationale**: función pura `canTransition(from, to)` trivialmente testeable
  (SC-003) y única; Commander delega la validación en esta función.
- **Alternativas consideradas**: switch repartido por comando (duplica reglas,
  riesgo de divergencia); máquina de estados con librería (dependencia innecesaria,
  viola Constitución VIII).

## Decisión 4: Superficie de comandos para cambio de estado

- **Decisión**: comandos semánticos uno por transición — `task start <id>`
  (todo→in-progress), `task done <id>` (in-progress→done), `task todo <id>`
  (in-progress→todo), `task reopen <id>` (done→todo).
- **Rationale**: alinea 1:1 con la máquina de estados; hace que FR-008 sea
  estructural (cada comando solo admite su transición) y los mensajes de error
  de uso son autodescriptivos. **Decisión revisable**: la alternativa
  `task status <id> <new-status>` es válida y el spec no la fija.
- **Alternativas consideradas**: comando único `status` (menos comandos pero la
  validación queda solo en runtime y los errores son menos guíados).

## Decisión 5: Atomicidad y concurrencia

- **Decisión**: cada operación de escritura es una sentencia única (o transaction
  explícita cuando hay lectura-modificación) con better-sqlite3, que es síncrono.
- **Rationale**: entre procesos, SQLite ya serializa escrituras; el spec solo
  exige "atómica, última escritura gana, sin corromper datos".
- **Alternativas consideradas**: bloqueo de archivos ad hoc (innecesario para el
  volumen y la concurrencia asumida).

## Decisión 6: Confirmación de borrado sin dependencias

- **Decisión**: prompt con `node:readline/promises` sobre stdin. Si stdin no es un
  TTY y no se pasó `--force`, la operación falla con mensaje claro sugiriendo
  `--force` (no se cuelga en pipes/CI).
- **Rationale**: resuelve FR-010 y el comportamiento en entornos no interactivos
  sin añadir librerías (Constitución VIII).
- **Alternativas consideradas**: `inquirer`/`prompts` (dependencias evitables);
  borrar siempre sin confirmar (viola el spec).

## Decisión 7: Colores en terminal

- **Decisión**: `picocolors` (o `node:util` `styleText` si el LTS objetivo lo
  permite de forma suficiente); la decisión final se toma al implementar
  favoreciendo cero dependencias si el runtime lo cubre.
- **Rationale**: Constitución IX permite colores solo en estados y prioridades;
  se minimiza superficie de dependencias (Constitución VIII).
- **Alternativas consideradas**: `chalk` (más pesado, ESM-only histórico).

## Decisión 8: Aislamiento de la base de datos para tests

- **Decisión**: variable de entorno opcional `TASK_CLI_DB` que sobreescribe la
  ruta por defecto `~/.task-cli/tasks.db`; los tests y el quickstart la usan para
  apuntar a archivos temporales.
- **Rationale**: permite tests end-to-end aislados y validación manual segura sin
  romper el contrato por defecto de la Constitución II.
- **Alternativas consideradas**: mockear better-sqlite3 (pierde la señal de
  regresión real de la capa `db/`).
