# Implementation Plan: task-cli (Gestión de Tareas Personales)

**Branch**: `001-personal-task-cli` | **Date**: 2026-10-15
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Summary

CLI de gestión de tareas personales instalable globalmente vía npm. Implementa cinco
operaciones — crear, listar/filtrar, cambiar estado, actualizar y eliminar tareas —
con persistencia local en SQLite, salida en tabla legible y una máquina de estados
que prohíbe el salto directo `todo → done`. Una única entidad ("Tarea"), sin
usuarios, red ni fechas de vencimiento.

## Technical Context

| Campo | Decisión | Fuente |
| --- | --- | --- |
| Lenguaje | TypeScript (estrictamente TS, sin JS puro en producción) | Constitución I |
| Runtime | Node.js LTS | Constitución I |
| Ejecución dev | `tsx` | Constitución I |
| Persistencia | SQLite + `better-sqlite3`, archivo `~/.task-cli/tasks.db` | Constitución II |
| Estructura | Plana: `commands/`, `db/`, `utils/` | Constitución III |
| Estilo | Funcional, funciones puras; `camelCase`, `PascalCase` solo tipos | Constitución IV |
| CLI framework | Commander.js | Constitución V |
| Errores | Sin stack traces; exit 0 éxito / 1 error | Constitución VI |
| Testing | Vitest (toda la lógica de negocio y `db/`) | Constitución VII |
| Dependencias | Mínimas; sin ORMs; sin librerías para problemas triviales | Constitución VIII |
| Tablas | `cli-table3`; colores solo en estado/prioridad | Constitución IX |
| Distribución | `npm install -g`, binario `task` | Constitución X |

No hay "NEEDS CLARIFICATION": la constitución resuelve todo el stack. No existen
dependencias externas ni integraciones con sistemas de terceros.

## Constitution Check

Todos los gates evaluados contra la constitución v1.0.0 — **PASS** en todos:

- **I. TypeScript + Node LTS**: todo el código fuente en `.ts`; build con `tsc`.
- **II. SQLite/better-sqlite3**: única opción de persistencia; ruta exacta
  `~/.task-cli/tasks.db`; sin ORM (SQL escrito a mano).
- **III. Estructura plana**: `src/commands/`, `src/db/`, `src/utils/`; sin capas
  adicionales (no hay services, repositories ni domain layers).
- **IV. Estilo funcional**: lógica de transiciones, validación y formateo como
  funciones puras; sin clases salvo las que imponga Commander/better-sqlite3.
- **V. Commander.js**: parseo de args y comandos exclusivamente con Commander.
- **VI. Errores orientados al usuario**: handler global que traduce errores a
  mensajes en español + exit 1; los stack traces jamás llegan a stderr del usuario.
- **VII. Vitest**: tests unitarios de la lógica de negocio y de la capa `db/`.
- **VIII. Dependencias mínimas**: solo las del stack (commander, better-sqlite3,
  cli-table3, vitest, tsx, typescript). El prompt de confirmación usa
  `node:readline/promises` (sin librería extra).
- **IX. Output legible**: listados con `cli-table3`; colores solo para estados y
  prioridades.
- **X. Instalación global**: `package.json` con `"bin": { "task": ... }` + shebang.

Sin violaciones; no se registra nada en Complexity Tracking.

## Project Structure

```
task-cli/
├── package.json              # bin: task → dist/index.js; scripts build/test
├── tsconfig.json             # TypeScript → dist/
├── src/
│   ├── index.ts              # entrypoint: shebang + registro de comandos Commander
│   ├── commands/             # add.ts, list.ts, status.ts (start/done/reopen/todo),
│   │                         # update.ts, delete.ts
│   ├── db/
│   │   ├── connection.ts     # abre/crea ~/.task-cli/tasks.db (o TASK_CLI_DB)
│   │   └── tasks.ts          # CRUD SQL puro: insert, list, getById, update, delete
│   └── utils/
│       ├── errors.ts         # manejo de errores + exit codes (0/1), sin stack traces
│       ├── state-machine.ts  # mapa de transiciones (fuente única de verdad)
│       ├── validation.ts     # título, prioridad, estado, id
│       ├── prompt.ts         # confirmación de borrado (node:readline/promises)
│       └── format.ts         # tablas (cli-table3), colores, fechas
└── tests/                    # Vitest: unit tests de utils/, db/ y commands/
```

La variable de entorno `TASK_CLI_DB` (opcional) permite apuntar a una base
temporal para tests y validación manual sin tocar `~/.task-cli/tasks.db`; cuando
no está definida se usa la ruta por defecto de la constitución.

## Complexity Tracking

*Ninguna violación de constitución que justificar.*

## Next Steps

Generar `tasks.md` organizado por historias de usuario con `/speckit.tasks`,
ejecutar con `/speckit.implement` y validar con [quickstart.md](./quickstart.md).
