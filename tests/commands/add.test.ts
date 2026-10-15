// Tests del comando add (T010, US1). Valida los escenarios de aceptación US1.1–US1.4.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { insertTask } from '../../src/db/tasks.js';
import { validatePriority, validateTitle } from '../../src/utils/validation.js';
import { AppError } from '../../src/utils/errors.js';
import { createTestDb, destroyTestDb, type TestDb } from '../helpers/test-db.js';

describe('comando add (US1)', () => {
  let testDb: TestDb;

  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    destroyTestDb(testDb);
  });

  it('US1.1: crea tarea con solo título (defaults medium/todo)', () => {
    const task = insertTask(testDb.db, { title: validateTitle('Comprar pan') });
    expect(task.title).toBe('Comprar pan');
    expect(task.priority).toBe('medium');
    expect(task.status).toBe('todo');
  });

  it('US1.2: crea tarea con prioridad high', () => {
    const task = insertTask(testDb.db, {
      title: validateTitle('Deploy'),
      priority: validatePriority('high'),
    });
    expect(task.priority).toBe('high');
  });

  it('US1.3: rechaza título vacío con AppError', () => {
    expect(() => validateTitle('')).toThrow(AppError);
    expect(() => validateTitle('    ')).toThrow(AppError);
  });

  it('US1.4: asocia la descripción a la tarea creada', () => {
    const task = insertTask(testDb.db, {
      title: validateTitle('Con desc'),
      description: 'mi descripción',
    });
    expect(task.description).toBe('mi descripción');
  });

  it('validación: rechaza prioridad inválida listando valores aceptados', () => {
    expect(() => validatePriority('urgent')).toThrow(/high, medium, low/);
  });
});
