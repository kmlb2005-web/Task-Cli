# Quickstart: validación de task-cli

**Feature**: 001-personal-task-cli | **Date**: 2026-10-15
Guía de validación extremo a extremo. No contiene implementación; los detalles
están en [contracts/cli.md](./contracts/cli.md) y [data-model.md](./data-model.md).

## Prerrequisitos

- Node.js LTS instalado.
- `npm install` en la raíz del proyecto.
- Build: `npm run build` (tsc → `dist/`); alternativa sin build:
  `npx tsx src/index.ts <comando>`.

## Aislamiento de la base de datos

Usar una base temporal para no tocar `~/.task-cli/tasks.db`:

```powershell
$env:TASK_CLI_DB = "$env:TEMP\task-cli-quickstart.db"
```

(Equivalente bash: `export TASK_CLI_DB=/tmp/task-cli-quickstart.db`.)

A lo largo de esta guía, `task` denota `node dist/index.js` (o `npx tsx
src/index.ts`).

## Escenarios de validación

### 1. Smoke test de instalación

```powershell
npm install -g .
task --help
```

**Esperado**: ayuda lista todos los comandos; exit 0. (Ejecutar al final, tras el
build.)

### 2. Happy path US1+US2+US3

```powershell
task add "Comprar pan"
task add "Deploy v2" --priority high --description "producción"
task list
task start 1
task done 1
task list
```

**Esperado** (contrato §add/§list/§start/§done):
- `add` imprime el ID asignado (1 y 2); `Comprar pan` queda `medium`/`todo`.
- `list` muestra tabla con ID, título, estado, prioridad, fecha; `Deploy v2`
  aparece primero (más reciente).
- Tras `start 1` y `done 1`, el listado muestra la tarea 1 en `done`.

### 3. Transición prohibida (FR-008, SC-003)

```powershell
task add "Tarea salto"
task done 3
```

**Esperado**: exit 1; mensaje explicando que debe pasar por `in-progress` antes.
La tarea 3 permanece en `todo` (verificar con `task list`).

### 4. Filtros (FR-006, escenarios US2.2–US2.5)

```powershell
task list --status done
task list --priority high
task list --status todo --priority high
task list --status done --priority low
```

**Esperado**: los dos primeros muestran solo coincidencias; el tercero intersecta
("Y"); el cuarto puede no tener resultados → mensaje amigable, exit 0.

### 5. Update (FR-009, escenarios US4)

```powershell
task update 1 --title "Comprar pan integral" --priority low
task update 1
```

**Esperado**: el primero cambia título y prioridad, manteniendo estado `done` y la
fecha de creación; el segundo falla (exit 1) indicando que se debe indicar al
menos un campo.

### 6. Delete con confirmación (FR-010, escenarios US5)

```powershell
task delete 2          # responder "n"
task list              # la tarea 2 sigue presente
task delete 2          # responder "y"
task list              # la tarea 2 desapareció
task delete 3 --force  # sin preguntar
```

**Esperado**: cancelar deja intacta la tarea; confirmar y `--force` la eliminan.

### 7. ID inexistente (FR-011)

```powershell
task update 999 --title "x"
task done 999
task delete 999 --force
```

**Esperado**: exit 1 en los tres; mensaje claro "la tarea no existe"; nada cambia.

### 8. Validación de entradas (edge cases)

```powershell
task add ""
task add "x" --priority urgent
task done 1            # tarea ya en done → transición done→in-progress prohibida
```

**Esperado**: exit 1 en los tres; mensajes listando los valores aceptados.

### 9. Persistencia (FR-012)

Cerrar la shell (limpiar `$env:TASK_CLI_DB`), abrir una nueva, apuntar de nuevo a
la misma base temporal y ejecutar `task list`.

**Esperado**: las tareas siguen presentes con sus datos.

### 10. Ausencia de stack traces (SC-006)

Repetir los escenarios 3, 5, 7 y 8 redirigiendo stderr a un archivo y buscando
patrones de traza (`at `, `.ts:`, `Error:` con stack).

**Esperado**: 0 coincidencias; solo mensajes humanos en español; exit 1.

## Tests automatizados

```powershell
npx vitest run
```

**Esperado**: todos los tests en verde. Deben cubrir al menos: máquina de
transiciones (incluido `todo → done` rechazado), validación de título/prioridad/
estado, filtrado combinado, no-reutilización de IDs y la capa `db/` sobre una base
temporal (Constitución VII).
