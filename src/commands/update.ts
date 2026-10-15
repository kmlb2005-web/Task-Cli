// Comando `task update` (US4, FR-009). Modifica título, descripción o prioridad
// por id, sin alterar estado ni fecha de creación.

import type { Command } from 'commander';
import { openDb } from '../db/connection.js';
import { getTaskById, updateTask } from '../db/tasks.js';
import { handleError } from '../index.js';
import { AppError } from '../utils/errors.js';
import { validateId, validatePriority, validateTitle } from '../utils/validation.js';

export function registerUpdateCommand(program: Command): void {
  program
    .command('update')
    .description('Actualiza el título, descripción o prioridad de una tarea')
    .argument('<id>', 'id de la tarea')
    .option('-t, --title <title>', 'nuevo título')
    .option('-d, --description <description>', 'nueva descripción')
    .option('-p, --priority <priority>', 'nueva prioridad: high | medium | low')
    .action(
      (
        idInput: string,
        options: { title?: string; description?: string; priority?: string },
      ) => {
        try {
          const id = validateId(idInput);

          const hasTitle = options.title !== undefined;
          const hasDescription = options.description !== undefined;
          const hasPriority = options.priority !== undefined;

          if (!hasTitle && !hasDescription && !hasPriority) {
            throw new AppError(
              'Debes indicar al menos un campo a modificar: --title, --description o --priority.',
            );
          }

          const db = openDb();
          try {
            if (getTaskById(db, id) === null) {
              throw new AppError(`La tarea #${id} no existe.`);
            }

            const input: { title?: string; description?: string; priority?: 'high' | 'medium' | 'low' } = {};
            if (hasTitle) input.title = validateTitle(options.title as string);
            if (hasDescription) input.description = options.description;
            if (hasPriority) input.priority = validatePriority(options.priority as string);

            updateTask(db, id, input);
            process.stdout.write(`Tarea #${id} actualizada.\n`);
          } finally {
            db.close();
          }
        } catch (err) {
          handleError(err);
        }
      },
    );
}
