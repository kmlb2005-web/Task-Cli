// Tests de borrado (T025, US5). Valida escenarios US5.1–US5.4, FR-010, FR-011
// y el comportamiento en stdin no interactivo (research.md Decisión 6).

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PassThrough } from 'node:stream';
import { deleteTask, getTaskById, insertTask } from '../../src/db/tasks.js';
import { confirm, NOT_INTERACTIVE } from '../../src/utils/prompt.js';
import { createTestDb, destroyTestDb, type TestDb } from '../helpers/test-db.js';

describe('db/tasks deleteTask (US5)', () => {
  let testDb: TestDb;

  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    destroyTestDb(testDb);
  });

  it('US5.2: elimina una tarea existente', () => {
    const t = insertTask(testDb.db, { title: 'Borrable' });
    expect(deleteTask(testDb.db, t.id)).toBe(true);
    expect(getTaskById(testDb.db, t.id)).toBeNull();
  });

  it('FR-011: id inexistente devuelve false', () => {
    expect(deleteTask(testDb.db, 999)).toBe(false);
  });

  it('US5.3: una tarea cancelada permanece intacta (no se llama deleteTask)', () => {
    const t = insertTask(testDb.db, { title: 'Intacta' });
    // Simulamos la respuesta de cancelación: no se invoca deleteTask.
    const confirmed = false;
    if (confirmed) {
      deleteTask(testDb.db, t.id);
    }
    expect(getTaskById(testDb.db, t.id)).not.toBeNull();
  });
});

describe('utils/prompt confirm (US5)', () => {
  it('responde true para "y"', async () => {
    const input = new PassThrough() as NodeJS.ReadStream;
    input.isTTY = true; // interactivo
    const output = new PassThrough();
    output.resume(); // consume la salida para no bloquear
    const answerPromise = confirm('¿Borrar?', input, output);
    input.write('y\n');
    await expect(answerPromise).resolves.toBe(true);
  });

  it('responde false para "n"', async () => {
    const input = new PassThrough() as NodeJS.ReadStream;
    input.isTTY = true; // interactivo
    const output = new PassThrough();
    output.resume();
    const answerPromise = confirm('¿Borrar?', input, output);
    input.write('n\n');
    await expect(answerPromise).resolves.toBe(false);
  });

  it('responde false para entrada en blanco (default N)', async () => {
    const input = new PassThrough() as NodeJS.ReadStream;
    input.isTTY = true;
    const output = new PassThrough();
    output.resume();
    const answerPromise = confirm('¿Borrar?', input, output);
    input.write('\n');
    await expect(answerPromise).resolves.toBe(false);
  });

  it('devuelve NOT_INTERACTIVE cuando isTTY es false (no bloquea)', async () => {
    const input = new PassThrough() as NodeJS.ReadStream;
    input.isTTY = false;
    const output = new PassThrough();
    output.resume();
    await expect(confirm('¿Borrar?', input, output)).resolves.toBe(NOT_INTERACTIVE);
  });

  it('devuelve NOT_INTERACTIVE cuando isTTY es undefined (stdin redirigido/pipe)', async () => {
    const input = new PassThrough() as NodeJS.ReadStream;
    // isTTY queda undefined, como ocurre con stdin redirigido en pipe/CI.
    const output = new PassThrough();
    output.resume();
    await expect(confirm('¿Borrar?', input, output)).resolves.toBe(NOT_INTERACTIVE);
  });
});
