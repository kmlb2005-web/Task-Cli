// Tests de la capa db/ para US1 (T009). Constitución VII: lógica de negocio con Vitest.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { insertTask } from '../../src/db/tasks.js';
import { createTestDb, destroyTestDb, type TestDb } from '../helpers/test-db.js';

describe('db/tasks insertTask (US1)', () => {
  let testDb: TestDb;

  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    destroyTestDb(testDb);
  });

  it('asigna id incremental', () => {
    const a = insertTask(testDb.db, { title: 'Primera' });
    const b = insertTask(testDb.db, { title: 'Segunda' });
    expect(a.id).toBe(1);
    expect(b.id).toBe(2);
  });

  it('usa defaults priority medium y status todo', () => {
    const task = insertTask(testDb.db, { title: 'Sin extras' });
    expect(task.priority).toBe('medium');
    expect(task.status).toBe('todo');
  });

  it('guarda created_at como ISO UTC y es inmutable al insertar', () => {
    const task = insertTask(testDb.db, { title: 'Con fecha' });
    expect(task.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it('almacena la descripción cuando se proporciona', () => {
    const task = insertTask(testDb.db, { title: 'Con desc', description: 'detalle' });
    expect(task.description).toBe('detalle');
  });

  it('almacena null cuando no hay descripción', () => {
    const task = insertTask(testDb.db, { title: 'Sin desc' });
    expect(task.description).toBeNull();
  });

  it('rechaza prioridad fuera del conjunto (constraint SQL)', () => {
    expect(() =>
      insertTask(testDb.db, { title: 'mala', priority: 'urgent' as never }),
    ).toThrow();
  });
});
