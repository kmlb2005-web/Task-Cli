#!/usr/bin/env node
// Entry point de task-cli. Commander.js es el único framework de CLI (Constitución V).
// El handler global garantiza que NUNCA se muestren stack traces al usuario
// y que los códigos de salida sean 0 (éxito) / 1 (error) — Constitución VI, FR-013/FR-014.
// Nota: se registran incrementalmente los comandos según se implementan las historias.

import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { AppError } from './utils/errors.js';
import { registerAddCommand } from './commands/add.js';
import { registerListCommand } from './commands/list.js';
import { registerStatusCommands } from './commands/status.js';
import { registerUpdateCommand } from './commands/update.js';
import { registerDeleteCommand } from './commands/delete.js';

export function buildProgram(): Command {
  const program = new Command();
  program
    .name('task')
    .description('CLI de gestión de tareas personales')
    .version('1.0.0');

  registerAddCommand(program);
  registerListCommand(program);
  registerStatusCommands(program);
  registerUpdateCommand(program);
  registerDeleteCommand(program);

  return program;
}

// Traduce cualquier error a un mensaje humano + exit code. Jamás imprime el stack.
export function handleError(err: unknown): never {
  if (err instanceof AppError) {
    process.stderr.write(`${err.message}\n`);
    process.exit(err.exitCode);
  }
  // Error inesperado: mensaje genérico en español, sin internals.
  process.stderr.write('Ocurrió un error inesperado. Inténtalo de nuevo.\n');
  process.exit(1);
}

// ¿Se ejecuta este módulo directamente como binario (no al importar en tests)?
// Comparamos rutas reales resueltas (symlinks + casing) para que funcione también
// en la instalación global de npm en Windows, donde la ruta de argv[1] puede
// diferir en mayúsculas/minúsculas de import.meta.url.
function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  try {
    const entryReal = realpathSync(entry).toLowerCase();
    const selfReal = realpathSync(fileURLToPath(import.meta.url)).toLowerCase();
    return entryReal === selfReal;
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  buildProgram().parseAsync(process.argv).catch(handleError);
}
