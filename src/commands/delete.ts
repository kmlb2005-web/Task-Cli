// Comando `task delete` (US5, FR-010). Elimina una tarea por id con confirmación
// previa; --force la omite. En stdin no interactivo sin --force, falla con un
// mensaje accionable en lugar de bloquear (research.md Decisión 6).

import type { Command } from 'commander';
import { openDb } from '../db/connection.js';
import { deleteTask, getTaskById } from '../db/tasks.js';
import { handleError } from '../index.js';
import { AppError } from '../utils/errors.js';
import { confirm, NOT_INTERACTIVE } from '../utils/prompt.js';
import { validateId } from '../utils/validation.js';

export function registerDeleteCommand(program: Command): void {
  program
    .command('delete')
    .description('Elimina una tarea por su id')
    .argument('<id>', 'id de la tarea')
    .option('-f, --force', 'omite la confirmación')
    .action(async (idInput: string, options: { force?: boolean }) => {
      try {
        const id = validateId(idInput);

        const db = openDb();
        try {
          if (getTaskById(db, id) === null) {
            throw new AppError(`La tarea #${id} no existe.`);
          }

          if (!options.force) {
            const answer = await confirm(`¿Eliminar la tarea #${id}?`);
            if (answer === NOT_INTERACTIVE) {
              throw new AppError(
                'No se puede pedir confirmación en un entorno no interactivo. Usa --force para eliminar sin confirmar.',
              );
            }
            if (!answer) {
              process.stdout.write('Operación cancelada. La tarea no se eliminó.\n');
              return;
            }
          }

          deleteTask(db, id);
          process.stdout.write(`Tarea #${id} eliminada.\n`);
        } finally {
          db.close();
        }
      } catch (err) {
        handleError(err);
      }
    });
}
