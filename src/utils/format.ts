// Formateo de salida de terminal (Constitución IX): tablas con cli-table3 y
// colores SOLO para estados y prioridades. Sin decoración adicional.

import Table from 'cli-table3';
import type { Task } from '../db/tasks.js';
import type { Priority, Status } from './state-machine.js';
import { PRIORITY_VALUES, STATUS_VALUES } from './state-machine.js';

// Colores por prioridad — solo estados y prioridades (Constitución IX).
const PRIORITY_COLOR: Record<Priority, (s: string) => string> = {
  high: (s) => `\x1b[31m${s}\x1b[0m`,    // rojo
  medium: (s) => `\x1b[33m${s}\x1b[0m`,  // amarillo
  low: (s) => `\x1b[32m${s}\x1b[0m`,     // verde
};

const STATUS_COLOR: Record<Status, (s: string) => string> = {
  todo: (s) => `\x1b[36m${s}\x1b[0m`,      // cian
  'in-progress': (s) => `\x1b[34m${s}\x1b[0m`, // azul
  done: (s) => `\x1b[32m${s}\x1b[0m`,      // verde
};

function colorizePriority(p: Priority): string {
  return PRIORITY_COLOR[p](p);
}

function colorizeStatus(s: Status): string {
  return STATUS_COLOR[s](s);
}

// Formatea la fecha ISO UTC a locale corto legible (YYYY-MM-DD HH:mm).
function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Renderiza las tareas como tabla con columnas ID, título, estado, prioridad, fecha.
export function renderTaskTable(tasks: Task[]): string {
  const table = new Table({
    head: ['ID', 'Título', 'Estado', 'Prioridad', 'Creada'],
    style: { head: [], border: [] },
  });

  for (const t of tasks) {
    table.push([
      String(t.id),
      t.title,
      colorizeStatus(t.status),
      colorizePriority(t.priority),
      formatCreatedAt(t.createdAt),
    ]);
  }

  return table.toString();
}

// Mensaje amigable cuando no hay resultados (no se muestra tabla vacía).
export function emptyListMessage(): string {
  return 'No hay tareas que coincidan con el filtro.';
}

export { PRIORITY_VALUES, STATUS_VALUES };
