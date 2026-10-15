// Conexión a SQLite (Constitución II: better-sqlite3, sin ORM).
// Archivo por defecto: ~/.task-cli/tasks.db; sobreescribible con TASK_CLI_DB
// para tests y validación manual (research.md Decisión 8).

import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

// DDL verbatim de data-model.md. AUTOINCREMENT garantiza que los IDs
// borrados no se reutilizan (edge case del spec / SC-004).
const CREATE_TABLE_SQL = `
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
`;

// Ruta de la base de datos: TASK_CLI_DB si existe; si no, la ruta por defecto.
export function resolveDbPath(): string {
  const fromEnv = process.env.TASK_CLI_DB;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv;
  }
  return join(homedir(), '.task-cli', 'tasks.db');
}

// Abre (creando si no existe) la base de datos y garantiza el esquema.
export function openDb(path = resolveDbPath()): Database.Database {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.exec(CREATE_TABLE_SQL);
  return db;
}
