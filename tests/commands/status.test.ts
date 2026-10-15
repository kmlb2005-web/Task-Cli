// Tests de comandos de estado (T019, US3). Valida transiciones válidas, inválidas
// y el caso de id inexistente (FR-011, SC-003).

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getTaskById, insertTask, updateTaskStatus } from '../../src/db/tasks.js';
import { AppError } from '../../src/utils/errors.js';
import { validateId } from '../../src/utils/validation.js';
import { createTestDb, destroyTestDb, type TestDb } from '../helpers/test-db.js';

describe('db/tasks updateTaskStatus (US3)', () => {
  let testDb: TestDb;

  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    destroyTestDb(testDb);
  });

  it('start: todo → in-progress', () => {
    const t = insertTask(testDb.db, { title: 'X' });
    expect(updateTaskStatus(testDb.db, t.id, 'in-progress')).toBe(true);
    expect(getTaskById(testDb.db, t.id)?.status).toBe('in-progress');
  });

  it('done: in-progress → done', () => {
    const t = insertTask(testDb.db, { title: 'X' });
    updateTaskStatus(testDb.db, t.id, 'in-progress');
    updateTaskStatus(testDb.db, t.id, 'done');
    expect(getTaskById(testDb.db, t.id)?.status).toBe('done');
  });

  it('todo: in-progress → todo (devolver al backlog)', () => {
    const t = insertTask(testDb.db, { title: 'X' });
    updateTaskStatus(testDb.db, t.id, 'in-progress');
    updateTaskStatus(testDb.db, t.id, 'todo');
    expect(getTaskById(testDb.db, t.id)?.status).toBe('todo');
  });

  it('reopen: done → todo', () => {
    const t = insertTask(testDb.db, { title: 'X' });
    updateTaskStatus(testDb.db, t.id, 'in-progress');
    updateTaskStatus(testDb.db, t.id, 'done');
    updateTaskStatus(testDb.db, t.id, 'todo');
    expect(getTaskById(testDb.db, t.id)?.status).toBe('todo');
  });

  it('FR-011: devuelve false para id inexistente sin modificar nada', () => {
    expect(updateTaskStatus(testDb.db, 999, 'in-progress')).toBe(false);
    expect(getTaskById(testDb.db, 999)).toBeNull();
  });

  it('la validación de transición vive en canTransition (no en db)', () => {
    // El rechazo de todo→done lo hace la capa de validación (status.ts + state-machine).
    // Aquí solo confirmamos que la db permite escribir el estado que se le pida.
    const t = insertTask(testDb.db, { title: 'X' });
    expect(updateTaskStatus(testDb.db, t.id, 'done')).toBe(true);
    expect(getTaskById(testDb.db, t.id)?.status).toBe('done');
  });
});

describe('validación de id (US3)', () => {
  it('rechaza id no numérico o no positivo', () => {
    expect(() => validateId('abc')).toThrow(AppError);
    expect(() => validateId('0')).toThrow(AppError);
    expect(() => validateId('-3')).toThrow(AppError);
  });
});
