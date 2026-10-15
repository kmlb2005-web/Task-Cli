// Tests de listTasks (T013, US2). Valida orden, filtros individuales y combinados.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { insertTask, listTasks } from '../../src/db/tasks.js';
import { createTestDb, destroyTestDb, type TestDb } from '../helpers/test-db.js';

describe('db/tasks listTasks (US2)', () => {
  let testDb: TestDb;

  beforeEach(() => {
    testDb = createTestDb();
    // Crea un conjunto mixto para probar filtros y orden.
    insertTask(testDb.db, { title: 'A', priority: 'high' });         // id 1, todo
    insertTask(testDb.db, { title: 'B', priority: 'low' });          // id 2, todo
    insertTask(testDb.db, { title: 'C', priority: 'high' });         // id 3, todo
    // Cambiamos estados manualmente para el escenario de filtros.
    testDb.db.prepare("UPDATE tasks SET status = 'done' WHERE id = 1").run();
    testDb.db.prepare("UPDATE tasks SET status = 'in-progress' WHERE id = 2").run();
  });

  afterEach(() => {
    destroyTestDb(testDb);
  });

  it('FR-005: ordena por created_at DESC (más reciente primero)', () => {
    const tasks = listTasks(testDb.db);
    expect(tasks.map((t) => t.id)).toEqual([3, 2, 1]);
  });

  it('filtra por status', () => {
    const tasks = listTasks(testDb.db, { status: 'done' });
    expect(tasks.map((t) => t.id)).toEqual([1]);
  });

  it('filtra por prioridad', () => {
    const tasks = listTasks(testDb.db, { priority: 'high' });
    expect(tasks.map((t) => t.id)).toEqual([3, 1]);
  });

  it('combina status y prioridad con semántica Y', () => {
    // high + todo => solo id 3 (id 1 es done, id 2 es in-progress/low)
    const tasks = listTasks(testDb.db, { status: 'todo', priority: 'high' });
    expect(tasks.map((t) => t.id)).toEqual([3]);
  });

  it('devuelve vacío cuando nada coincide', () => {
    const tasks = listTasks(testDb.db, { status: 'done', priority: 'low' });
    expect(tasks).toEqual([]);
  });
});
