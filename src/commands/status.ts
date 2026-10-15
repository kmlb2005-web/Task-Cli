// Comandos de cambio de estado (US3, FR-007/FR-008). Comandos semánticos uno
// por transición (research.md Decisión 4): start, done, todo, reopen.

import type { Command } from 'commander';
import { openDb } from '../db/connection.js';
import { getTaskById, updateTaskStatus } from '../db/tasks.js';
import { handleError } from '../index.js';
import { AppError } from '../utils/errors.js';
import { allowedTargets, canTransition, type Status } from '../utils/state-machine.js';
import { validateId } from '../utils/validation.js';

// Aplica una transición validada; lanza AppError con mensajes claros si no aplica.
function applyTransition(idInput: string, to: Status): void {
  const id = validateId(idInput);
  const db = openDb();
  try {
    const task = getTaskById(db, id);
    if (task === null) {
      throw new AppError(`La tarea #${id} no existe.`);
    }
    if (!canTransition(task.status, to)) {
      const targets = allowedTargets(task.status).join(', ');
      throw new AppError(
        `No se puede cambiar la tarea #${id} de "${task.status}" a "${to}". ` +
          `Estado actual "${task.status}" solo permite: ${targets}.`,
      );
    }
    updateTaskStatus(db, id, to);
    process.stdout.write(`Tarea #${id} ahora está en "${to}".\n`);
  } finally {
    db.close();
  }
}

export function registerStatusCommands(program: Command): void {
  program
    .command('start')
    .description('Pasa una tarea de todo a in-progress')
    .argument('<id>', 'id de la tarea')
    .action((id: string) => run(() => applyTransition(id, 'in-progress')));

  program
    .command('done')
    .description('Marca una tarea como done (desde in-progress)')
    .argument('<id>', 'id de la tarea')
    .action((id: string) => run(() => applyTransition(id, 'done')));

  program
    .command('todo')
    .description('Devuelve una tarea a todo (desde in-progress)')
    .argument('<id>', 'id de la tarea')
    .action((id: string) => run(() => applyTransition(id, 'todo')));

  program
    .command('reopen')
    .description('Reabre una tarea done de vuelta a todo')
    .argument('<id>', 'id de la tarea')
    .action((id: string) => run(() => applyTransition(id, 'todo')));
}

function run(fn: () => void): void {
  try {
    fn();
  } catch (err) {
    handleError(err);
  }
}
