# task-cli

CLI de gestión de tareas personales desde la terminal. Instalable globalmente,
con persistencia local en SQLite y salida en tabla legible.

## Instalación

```bash
npm install -g .
```

Esto expone el binario `task` disponible desde cualquier directorio.

## Uso

La base de datos se guarda por defecto en `~/.task-cli/tasks.db`. Puedes
sobreescribir la ruta con la variable de entorno `TASK_CLI_DB` (útil para tests o
para probar sin tocar tus datos reales).

### Crear una tarea

```bash
task add "Comprar pan"
task add "Deploy v2" --priority high --description "producción"
```

- `--priority`: `high` | `medium` | `low` (por defecto `medium`).
- `--description`: opcional.
- La tarea nace siempre en estado `todo` con un ID numérico autoincremental.

### Listar tareas

```bash
task list
task list --status done
task list --priority high
task list --status todo --priority high   # filtros combinados (Y)
```

Muestra una tabla con ID, título, estado, prioridad y fecha de creación, ordenada
de más reciente a más antigua.

### Cambiar el estado

La máquina de estados permite únicamente estas transiciones:

- `task start <id>`   → `todo → in-progress`
- `task done <id>`    → `in-progress → done`
- `task todo <id>`    → `in-progress → todo`
- `task reopen <id>`  → `done → todo`

El salto directo `todo → done` está permitido solo tras pasar por `in-progress`;
si lo intentas directamente recibirás un mensaje explicándolo.

### Actualizar una tarea

```bash
task update 1 --title "Comprar pan integral"
task update 1 --priority low --description "nueva desc"
```

Modifica título, descripción o prioridad. No altera el estado ni la fecha de
creación.

### Eliminar una tarea

```bash
task delete 1              # pide confirmación
task delete 1 --force      # elimina sin confirmar
```

En un entorno no interactivo (pipe, CI) sin `--force`, la operación falla con un
mensaje accionable en lugar de quedarse bloqueada esperando confirmación.

## Códigos de salida

- `0` → éxito
- `1` → error (mensaje claro en stderr, nunca stack traces)

## Desarrollo

```bash
npm install
npm run build        # compila a dist/
npm run dev -- add "prueba"   # ejecución directa con tsx
npx vitest run       # tests unitarios (Vitest)
```

La lógica de negocio (transiciones, validación, filtrado) y la capa `db/` tienen
tests unitarios. Usa `TASK_CLI_DB` para apuntar a una base temporal durante el
desarrollo.

## Estructura

```
src/
├── index.ts          # entrypoint (Commander) y manejo global de errores
├── commands/         # add, list, status, update, delete
├── db/               # conexión SQLite y operaciones SQL
└── utils/            # errores, validación, máquina de estados, formato, prompt
```
