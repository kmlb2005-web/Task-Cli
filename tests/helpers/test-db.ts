// Helper de tests: crea una base temporal por test y la limpia al final.
// Usa TASK_CLI_DB (research.md Decisión 8) para no tocar ~/.task-cli/tasks.db.

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb } from '../../src/db/connection.js';

export interface TestDb {
  db: import('better-sqlite3').Database;
  path: string;
}

// Crea un directorio temporal y devuelve una conexión inicializada.
export function createTestDb(): TestDb {
  const dir = mkdtempSync(join(tmpdir(), 'task-cli-test-'));
  const path = join(dir, 'tasks.db');
  const db = openDb(path);
  return { db, path };
}

// Cierra y borra el archivo temporal completo.
export function destroyTestDb(testDb: TestDb): void {
  testDb.db.close();
  // El directorio temporal contiene tasks.db (+ WAL/SHM); lo eliminamos entero.
  const dir = testDb.path.substring(0, testDb.path.lastIndexOf('\\') >= 0
    ? testDb.path.lastIndexOf('\\')
    : testDb.path.lastIndexOf('/'));
  rmSync(dir, { recursive: true, force: true });
}
