// Comando `task add` (US1, FR-001/FR-002/FR-003).

import type { Command } from 'commander';
import { openDb } from '../db/connection.js';
import { insertTask } from '../db/tasks.js';
import { handleError } from '../index.js';
import { validatePriority, validateTitle } from '../utils/validation.js';

export function registerAddCommand(program: Command): void {
  program
    .command('add')
    .description('Crea una tarea nueva')
    .argument('<title>', 'título de la tarea (obligatorio)')
    .option('-p, --priority <priority>', 'prioridad: high | medium | low', 'medium')
    .option('-d, --description <description>', 'descripción opcional')
    .action((title: string, options: { priority: string; description?: string }) => {
      try {
        const safeTitle = validateTitle(title);
        const priority = validatePriority(options.priority);
        const db = openDb();
        const task = insertTask(db, {
          title: safeTitle,
          description: options.description ?? null,
          priority,
        });
        db.close();
        process.stdout.write(
          `Tarea #${task.id} creada: "${task.title}" [${task.status} | ${task.priority}]\n`,
        );
      } catch (err) {
        handleError(err);
      }
    });
}
