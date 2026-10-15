# Data Model: task-cli

**Feature**: 001-personal-task-cli | **Date**: 2026-10-15
**Entidad única**: Tarea (el spec explícitamente excluye usuarios, subtareas,
dependencias, tags y fechas de vencimiento).

## Entidad: Tarea (tabla `tasks`)

| Campo | Tipo SQL | Restricción (verbatim del spec/data model) | Origen |
| --- | --- | --- | --- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | "identificador numérico único e incremental" (FR-002); "los IDs eliminados no se reutilizan" (edge case/SC-004) | Asignado |
| `title` | `TEXT NOT NULL` | "título obligatorio"; se rechaza "vacío o solo en blanco" (edge case) — validar con trim | Usuario |
| `description` | `TEXT NULL` | Opcional (FR-001) | Usuario |
| `priority` | `TEXT NOT NULL` | `CHECK (priority IN ('high','medium','low'))`, default `'medium'` (FR-003) | Usuario o default |
| `status` | `TEXT NOT NULL` | `CHECK (status IN ('todo','in-progress','done'))`, default `'todo'` (FR-002/FR-007) | Sistema |
| `created_at` | `TEXT NOT NULL` | ISO 8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`); inmutable, "no se modifica nunca" (supuesto del spec) | Sistema |

DDL:

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT    NULL,
  priority    TEXT    NOT NULL DEFAULT 'medium'
                          CHECK (priority IN ('high','medium','low')),
  status      TEXT    NOT NULL DEFAULT 'todo'
                          CHECK (status IN ('todo','in-progress','done')),
  created_at  TEXT    NOT NULL
);
```

## Máquina de estados (fuente única de verdad)

| Estado actual | Destinos permitidos |
| --- | --- |
| `todo` | `in-progress` |
| `in-progress` | `done`, `todo` |
| `done` | `todo` |

- Transición **prohibida explícita**: `todo → done` (FR-008, SC-003) — no se puede
  completar sin pasar por `in-progress`.
- `done → in-progress` también prohibida (scenario US3.6).
- Implementación: mapa puro `Record<Status, Status[]>` + `canTransition(from,to)`.

## Reglas de validación

- `title`: obligatorio; se valida tras `trim()`; vacío o solo espacios → rechazo.
- `priority`: solo `high|medium|low`; valor distinto → rechazo listando los
  aceptados (edge case).
- `status`: solo `todo|in-progress|done` como destino; valor distinto → rechazo.
- `id` en `update`/`delete`/cambio de estado: debe existir; si no → mensaje claro,
  exit 1, sin modificar nada (FR-011).
- `update`: debe indicarse al menos uno de `title`/`description`/`priority`; si
  ninguno → rechazo (edge case). No acepta `status` ni `created_at` (FR-009).

## Relaciones

Ninguna. El modelo es de una sola tabla; no hay FKs ni entidades relacionadas.

## Volumen y rendimiento

- Objetivo del spec: 500 tareas listadas en <1s (SC-002) — sin índice necesario
  más allá de la PK; `ORDER BY created_at DESC` es suficiente a este volumen.
