// Capa de acceso a datos de tareas (Constitución II: better-sqlite3, SQL a mano, sin ORM).

import type { Database } from 'better-sqlite3';
import type { Priority, Status } from '../utils/state-machine.js';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  createdAt: string;
}

interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  created_at: string;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
  };
}

export interface InsertTaskInput {
  title: string;
  description?: string | null;
  priority?: Priority;
}

// Genera el timestamp ISO 8601 UTC (research.md Decisión 1).
function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// Inserta una tarea con defaults medium/todo y created_at UTC. Devuelve la creada.
export function insertTask(db: Database, input: InsertTaskInput): Task {
  const createdAt = nowIso();
  const result = db
    .prepare(
      `INSERT INTO tasks (title, description, priority, status, created_at)
       VALUES (?, ?, ?, 'todo', ?)`,
    )
    .run(input.title, input.description ?? null, input.priority ?? 'medium', createdAt);

  return {
    id: Number(result.lastInsertRowid),
    title: input.title,
    description: input.description ?? null,
    priority: input.priority ?? 'medium',
    status: 'todo',
    createdAt,
  };
}

export interface ListTasksFilter {
  status?: Status;
  priority?: Priority;
}

// Devuelve tareas opcionalmente filtradas, ordenadas por created_at DESC (FR-005).
// Los filtros se combinan con semántica "Y" (supuesto del spec) y son parametrizados.
export function listTasks(db: Database, filter: ListTasksFilter = {}): Task[] {
  const clauses: string[] = [];
  const params: string[] = [];

  if (filter.status !== undefined) {
    clauses.push('status = ?');
    params.push(filter.status);
  }
  if (filter.priority !== undefined) {
    clauses.push('priority = ?');
    params.push(filter.priority);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db
    .prepare(`SELECT id, title, description, priority, status, created_at FROM tasks ${where} ORDER BY created_at DESC, id DESC`)
    .all(...params) as TaskRow[];

  return rows.map(rowToTask);
}

// Devuelve una tarea por id, o null si no existe.
export function getTaskById(db: Database, id: number): Task | null {
  const row = db
    .prepare('SELECT id, title, description, priority, status, created_at FROM tasks WHERE id = ?')
    .get(id) as TaskRow | undefined;
  return row ? rowToTask(row) : null;
}

// Actualiza el estado de una tarea por id. Devuelve false si el id no existe (FR-011).
export function updateTaskStatus(db: Database, id: number, status: Status): boolean {
  const result = db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id);
  return result.changes > 0;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: Priority;
}

// Actualiza title/description/priority — nunca status ni created_at (FR-009).
// Devuelve false si el id no existe (FR-011).
export function updateTask(db: Database, id: number, input: UpdateTaskInput): boolean {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (input.title !== undefined) {
    fields.push('title = ?');
    params.push(input.title);
  }
  if (input.description !== undefined) {
    fields.push('description = ?');
    params.push(input.description);
  }
  if (input.priority !== undefined) {
    fields.push('priority = ?');
    params.push(input.priority);
  }

  if (fields.length === 0) {
    return false;
  }

  params.push(id);
  const result = db
    .prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`)
    .run(...params);
  return result.changes > 0;
}

// Elimina una tarea por id. Devuelve false si el id no existe (FR-011).
export function deleteTask(db: Database, id: number): boolean {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}
