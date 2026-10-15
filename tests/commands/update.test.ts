// Tests de actualización (T022, US4). Valida escenarios US4.1–US4.4, FR-009,
// y los edge cases de "sin campos" y "id inexistente".

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getTaskById, insertTask, updateTask } from '../../src/db/tasks.js';
import { createTestDb, destroyTestDb, type TestDb } from '../helpers/test-db.js';

describe('db/tasks updateTask (US4)', () => {
  let testDb: TestDb;

  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    destroyTestDb(testDb);
  });

  it('US4.1: cambia el título dejando intactos los demás atributos', () => {
    const t = insertTask(testDb.db, { title: 'Tarea vieja', priority: 'low' });
    updateTask(testDb.db, t.id, { title: 'Tarea nueva' });
    const updated = getTaskById(testDb.db, t.id)!;
    expect(updated.title).toBe('Tarea nueva');
    expect(updated.priority).toBe('low');
    expect(updated.status).toBe('todo');
  });

  it('US4.2: cambia la prioridad', () => {
    const t = insertTask(testDb.db, { title: 'X' });
    updateTask(testDb.db, t.id, { priority: 'low' });
    expect(getTaskById(testDb.db, t.id)?.priority).toBe('low');
  });

  it('US4.3: actualiza título y prioridad a la vez', () => {
    const t = insertTask(testDb.db, { title: 'X' });
    updateTask(testDb.db, t.id, { title: 'Y', priority: 'high' });
    const updated = getTaskById(testDb.db, t.id)!;
    expect(updated.title).toBe('Y');
    expect(updated.priority).toBe('high');
  });

  it('US4.4 / FR-009: no altera el estado al actualizar descripción', () => {
    const t = insertTask(testDb.db, { title: 'X' });
    // Pasamos a in-progress manualmente, luego actualizamos descripción.
    testDb.db.prepare("UPDATE tasks SET status = 'in-progress' WHERE id = ?").run(t.id);
    updateTask(testDb.db, t.id, { description: 'nueva desc' });
    const updated = getTaskById(testDb.db, t.id)!;
    expect(updated.status).toBe('in-progress');
    expect(updated.description).toBe('nueva desc');
  });

  it('FR-009: no altera created_at', () => {
    const t = insertTask(testDb.db, { title: 'X' });
    updateTask(testDb.db, t.id, { title: 'Y' });
    expect(getTaskById(testDb.db, t.id)?.createdAt).toBe(t.createdAt);
  });

  it('edge case: update sin campos devuelve false y no modifica nada', () => {
    const t = insertTask(testDb.db, { title: 'X' });
    expect(updateTask(testDb.db, t.id, {})).toBe(false);
    expect(getTaskById(testDb.db, t.id)?.title).toBe('X');
  });

  it('FR-011: id inexistente devuelve false', () => {
    expect(updateTask(testDb.db, 999, { title: 'X' })).toBe(false);
  });
});
