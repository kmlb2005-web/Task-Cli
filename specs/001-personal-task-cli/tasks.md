# Tasks: task-cli (Gestión de Tareas Personales)

**Input**: Design documents from `/specs/001-personal-task-cli/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cli.md, quickstart.md

**Tests**: Incluidos. La Constitución VII (task-cli v1.0.0) exige tests unitarios
con Vitest para toda la lógica de negocio y la capa `db/`; esto cuenta como
solicitud explícita del proyecto.

**Organization**: Tareas agrupadas por historia de usuario para permitir
implementación e testing independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Ejecutable en paralelo (archivos distintos, sin dependencias)
- **[Story]**: Historia a la que pertenece (US1–US5)

## Path Conventions

Proyecto único: `src/` y `tests/` en la raíz (estructura plana de la Constitución
III: `commands/`, `db/`, `utils/`).

---

## Phase 1: Setup (Infraestructura Compartida)

**Purpose**: Inicialización del proyecto TypeScript según plan.md

- [X] T001 Initialize package.json (name "task-cli", "bin": { "task": "dist/index.js" }) and tsconfig.json (strict, outDir dist/) per plan.md structure
- [X] T002 [P] Install dependencies per plan.md: commander, better-sqlite3, cli-table3; dev: typescript, tsx, vitest, @types/node, @types/better-sqlite3, @types/cli-table3 in package.json
- [X] T003 [P] Configure Vitest in vitest.config.ts (include tests/**/*.test.ts, environment node) and add npm scripts "build", "dev", "test" in package.json

**Checkpoint**: Proyecto inicializa, compila y `npx vitest run` pasa sin tests.

---

## Phase 2: Foundational (Prerrequisitos Bloqueantes)

**Purpose**: Infraestructura core que DEBE estar completa ANTES de cualquier historia

**?? CRITICAL**: Ninguna historia puede empezar hasta completar esta fase

- [X] T004 Implement database connection in src/db/connection.ts: open/create SQLite file at ~/.task-cli/tasks.db, overridable via TASK_CLI_DB env var, and CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NULL, priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')), status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in-progress','done')), created_at TEXT NOT NULL) per data-model.md DDL verbatim
- [X] T005 [P] Implement error handling in src/utils/errors.ts: AppError class with message + exitCode (0 success, 1 error per FR-014), and fail(message) helper that prints message to stderr WITHOUT stack traces (FR-013, Constitución VI)
- [X] T006 [P] Implement validation functions in src/utils/validation.ts: validateTitle (reject empty or whitespace-only after trim per edge case), validatePriority (only 'high'|'medium'|'low', error lists accepted values per edge case), validateStatus, validateId (positive integer) — all pure functions per Constitución IV
- [X] T007 [P] Implement state machine in src/utils/state-machine.ts: STATUS_VALUES and PRIORITY_VALUES consts, and pure canTransition(from, to) using single-source map Record<Status, Status[]> { todo: ['in-progress'], in-progress: ['done','todo'], done: ['todo'] } per research.md Decisión 3 — todo→done MUST be rejected (FR-008)
- [X] T008 Create entrypoint in src/index.ts: shebang #!/usr/bin/env node, Commander program setup (name "task"), and global error handler that catches AppError → prints message + process.exit(1), unexpected errors → generic Spanish message + exit(1), NEVER printing stack traces (FR-013)

**Checkpoint**: Fundación lista — las historias pueden empezar en paralelo.

---

## Phase 3: User Story 1 - Crear una tarea (Priority: P1) ?? MVP

**Goal**: Registrar tareas con título obligatorio, prioridad opcional (default
medium) y descripción opcional; ID numérico autoincremental; estado inicial todo.

**Independent Test**: `task add "Comprar pan"` queda registrada con prioridad
medium y estado todo; `task add ""` falla con mensaje claro.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T009 [P] [US1] Test db layer in tests/db/tasks.test.ts: insertTask assigns incremental id, defaults priority 'medium' and status 'todo', stores created_at ISO UTC, rejects whitespace-only title (uses TASK_CLI_DB temp file per research.md Decisión 8)
- [X] T010 [P] [US1] Test add command in tests/commands/add.test.ts: creates task with only title (defaults medium/todo per spec scenario US1.1), with --priority high (US1.2), rejects empty title (US1.3), stores description (US1.4)

### Implementation for User Story 1

- [X] T011 [US1] Implement insertTask in src/db/tasks.ts: INSERT with AUTOINCREMENT id, default 'medium'/'todo', created_at as ISO 8601 UTC (YYYY-MM-DDTHH:MM:SSZ) per research.md Decisión 1, returns created Task with id
- [X] T012 [US1] Implement command in src/commands/add.ts: task add <title> [--priority <p>] [--description <d>] per contracts/cli.md, validating via T006, calling insertTask, printing confirmation with assigned id, and register command in src/index.ts

**Checkpoint**: US1 completamente funcional e independiente — `task add` + `task list` manual (o SELECT directo) confirma persistencia.

---

## Phase 4: User Story 2 - Listar y filtrar tareas (Priority: P2)

**Goal**: Tabla con ID, título, estado, prioridad, fecha de creación; orden más
reciente primero; filtros --status y --priority, combinables con semántica "Y".

**Independent Test**: Crear 3 tareas mixtas y verificar orden, columnas, filtros
individuales, combinados y mensaje amigable sin resultados.

### Tests for User Story 2

- [X] T013 [P] [US2] Test list queries in tests/db/list.test.ts: listTasks returns created_at DESC order (FR-005), filters by status, by priority, and combined AND semantics per spec assumption
- [X] T014 [P] [US2] Test table formatting in tests/utils/format.test.ts: renderTaskTable shows columns ID/título/estado/prioridad/fecha (FR-004), empty result renders friendly message not empty table (edge case)

### Implementation for User Story 2

- [X] T015 [US2] Implement listTasks in src/db/tasks.ts: SELECT with optional WHERE status/priority (parameterized, no string concat), ORDER BY created_at DESC
- [X] T016 [US2] Implement renderTaskTable in src/utils/format.ts: cli-table3 table with 5 columns per contracts/cli.md, colors ONLY for status and priority cells (Constitución IX)
- [X] T017 [US2] Implement command in src/commands/list.ts: task list [--status <s>] [--priority <p>] per contracts/cli.md, validating flag values, friendly message when no results, register in src/index.ts

**Checkpoint**: US1+US2 funcionan: ciclo crear→listar completo con filtros.

---

## Phase 5: User Story 3 - Cambiar el estado de una tarea (Priority: P3)

**Goal**: Transiciones por ID mediante comandos semánticos: start
(todo→in-progress), done (in-progress→done), todo (in-progress→todo), reopen
(done→todo); todo→done rechazado con mensaje explicativo.

**Independent Test**: `task add` + `task start 1` + `task done 1` avanzan estados;
`task done <id-en-todo>` falla exit 1 explicando que pase por in-progress.

### Tests for User Story 3

- [X] T018 [P] [US3] Test state machine in tests/utils/state-machine.test.ts: allows all 4 valid transitions per data-model.md, rejects todo→done (FR-008), rejects done→in-progress (spec scenario US3.6), rejects same-state transitions
- [X] T019 [P] [US3] Test status commands in tests/commands/status.test.ts: start/done/todo/reopen update status by id, reject invalid transition with Spanish message (SC-003), reject nonexistent id without modifying data (FR-011)

### Implementation for User Story 3

- [X] T020 [US3] Implement updateTaskStatus in src/db/tasks.ts: UPDATE status by id, returns boolean found (false → caller raises "la tarea no existe" per FR-011)
- [X] T021 [US3] Implement status commands in src/commands/status.ts: task start|done|todo|reopen <id> per contracts/cli.md and research.md Decisión 4, validating transition via canTransition, error message for todo→done MUST explain "debe pasar primero por in-progress" (spec scenario US3.5), register in src/index.ts

**Checkpoint**: US1+US2+US3: ciclo completo crear→listar→avanzar→done funcional.

---

## Phase 6: User Story 4 - Actualizar una tarea (Priority: P4)

**Goal**: Modificar título, descripción o prioridad por ID sin alterar estado ni
fecha de creación.

**Independent Test**: `task update 1 --title "x" --priority low` cambia solo esos
campos; `task update 1` sin campos falla.

### Tests for User Story 4

- [X] T022 [P] [US4] Test update flow in tests/commands/update.test.ts + tests/db/tasks.test.ts: updates title and priority together (spec scenario US4.3), preserves status and created_at (US4.4, FR-009), rejects update with no fields (edge case), rejects nonexistent id (FR-011)

### Implementation for User Story 4

- [X] T023 [US4] Implement updateTask in src/db/tasks.ts: partial UPDATE of title/description/priority only (never status/created_at), parameterized, returns found boolean
- [X] T024 [US4] Implement command in src/commands/update.ts: task update <id> [--title] [--description] [--priority] per contracts/cli.md, reject when no field provided with actionable message, register in src/index.ts

**Checkpoint**: US1–US4 funcionan; tarea es editable sin romper su historial.

---

## Phase 7: User Story 5 - Eliminar una tarea (Priority: P5)

**Goal**: Eliminar por ID con confirmación previa; `--force` la omite; stdin no
interactivo sin `--force` falla sugiriendo `--force`.

**Independent Test**: `task delete 2` pide confirmación (n → intacta, y → borrada);
`task delete 3 --force` borra sin preguntar.

### Tests for User Story 5

- [X] T025 [P] [US5] Test delete command in tests/commands/delete.test.ts: deletes after confirmation (spec scenario US5.2), keeps task on cancel (US5.3), deletes without prompt with --force (US5.4), rejects nonexistent id (FR-011), fails with actionable message when stdin is not interactive and --force absent (research.md Decisión 6)

### Implementation for User Story 5

- [X] T026 [P] [US5] Implement confirmPrompt in src/utils/prompt.ts: confirmation via node:readline/promises per research.md Decisión 6 — no extra dependencies (Constitución VIII); non-TTY stdin returns special signal instead of blocking
- [X] T027 [US5] Implement deleteTask in src/db/tasks.ts: DELETE by id, returns found boolean
- [X] T028 [US5] Implement command in src/commands/delete.ts: task delete <id> [--force] per contracts/cli.md, confirm via T026 unless --force, register in src/index.ts

**Checkpoint**: Las 5 historias funcionan de forma independiente — producto completo.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras transversales antes de considerar terminada la feature

- [X] T029 [P] Verify package.json "bin" wiring and shebang: npm run build then npm install -g . then task --help works from another directory (FR-015, quickstart escenario 1)
- [X] T030 [P] Review all error paths for SC-006: grep for console.error(err)/stack usage, ensure every user-facing failure goes through AppError with Spanish actionable message and exit 1 (FR-013, FR-014)
- [X] T031 [P] Write README.md in docs/: install (npm install -g), usage examples per command, DATABASE location ~/.task-cli/tasks.db, in Spanish
- [X] T032 Run full validation: npx vitest run green + npm run build clean + execute quickstart.md scenarios 2–8 against temp TASK_CLI_DB and confirm expected outcomes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — empieza de inmediato
- **Foundational (Phase 2)**: Depende de Setup — BLOQUEA todas las historias
- **US1 (Phase 3)**: Depende de Foundational
- **US2 (Phase 4)**: Depende de Foundational; usa db/ de US1 (misma historia base)
- **US3 (Phase 5)**: Depende de Foundational
- **US4 (Phase 6)**: Depende de Foundational
- **US5 (Phase 7)**: Depende de Foundational
- **Polish (Phase 8)**: Depende de las historias deseadas (MVP: solo US1)

### User Story Dependencies

- **US1 (P1)**: Tras Foundational — sin dependencias de otras historias
- **US2 (P2)**: Tras Foundational — añade listTasks a src/db/tasks.ts (archivo creado en US1)
- **US3 (P3)**: Tras Foundational — independiente; usa updateTaskStatus propio
- **US4 (P4)**: Tras Foundational — añade updateTask a src/db/tasks.ts
- **US5 (P5)**: Tras Foundational — añade deleteTask a src/db/tasks.ts

### Within Each User Story

- Tests primero y en rojo antes de implementar (Constitución VII)
- Capa `db/` antes del comando que la consume
- Comando registrado en src/index.ts al final de la historia

### Parallel Opportunities

- T002, T003 (Setup) en paralelo entre sí
- T005, T006, T007 (utils/) en paralelo — archivos distintos
- Dentro de cada historia: todos los tests marcados [P] en paralelo
- US3, US4 y US5 son independientes entre sí: pueden ejecutarse en paralelo
  tras US1/US2 (añaden funciones distintas a src/db/tasks.ts — coordinar si
  comparten edición del archivo)
- T029, T030, T031 (Polish) en paralelo

---

## Parallel Example: User Story 3

```text
# Launch both test tasks together:
Task: "Test state machine in tests/utils/state-machine.test.ts"
Task: "Test status commands in tests/commands/status.test.ts"

# Then implementation (sequential: db before command):
Task: "Implement updateTaskStatus in src/db/tasks.ts"
Task: "Implement status commands in src/commands/status.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloquea todo)
3. Completar Phase 3: User Story 1
4. **PARAR y VALIDAR**: `task add` funciona extremo a extremo
5. Publicar/demo si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. + US1 → crear y validar → MVP entregable
3. + US2 → listar y filtrar → incremento visible
4. + US3 → máquina de estados → producto funcional completo
5. + US4 → edición
6. + US5 → borrado seguro
7. Polish → empaquetado global y docs

Cada historia se suma sin romper las anteriores; validar con `npx vitest run` tras
cada una.

---

## Notes

- [P] = archivos distintos, sin dependencias
- Cada historia es completable y testeable de forma independiente
- Verificar que los tests fallen antes de implementar
- Commit tras cada tarea o grupo lógico (mensaje en español)
- Detalles de contrato en contracts/cli.md; reglas de datos en data-model.md
