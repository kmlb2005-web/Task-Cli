// Comando `task list` (US2, FR-004/FR-005/FR-006).

import type { Command } from 'commander';
import { openDb } from '../db/connection.js';
import { listTasks } from '../db/tasks.js';
import { handleError } from '../index.js';
import { emptyListMessage, renderTaskTable } from '../utils/format.js';
import { validatePriority, validateStatus } from '../utils/validation.js';

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('Lista las tareas en formato tabla')
    .option('-s, --status <status>', 'filtrar por estado: todo | in-progress | done')
    .option('-p, --priority <priority>', 'filtrar por prioridad: high | medium | low')
    .action((options: { status?: string; priority?: string }) => {
      try {
        const filter: { status?: 'todo' | 'in-progress' | 'done'; priority?: 'high' | 'medium' | 'low' } = {};
        if (options.status !== undefined) filter.status = validateStatus(options.status);
        if (options.priority !== undefined) filter.priority = validatePriority(options.priority);

        const db = openDb();
        const tasks = listTasks(db, filter);
        db.close();

        if (tasks.length === 0) {
          process.stdout.write(`${emptyListMessage()}\n`);
          return;
        }
        process.stdout.write(`${renderTaskTable(tasks)}\n`);
      } catch (err) {
        handleError(err);
      }
    });
}
