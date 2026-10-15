// Tests de formateo de tabla (T014, US2). Valida columnas y mensaje amigable vacío.

import { describe, expect, it } from 'vitest';
import { emptyListMessage, renderTaskTable } from '../../src/utils/format.js';
import type { Task } from '../../src/db/tasks.js';

const sample: Task[] = [
  {
    id: 3,
    title: 'Deploy v2',
    description: null,
    priority: 'high',
    status: 'done',
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 1,
    title: 'Comprar pan',
    description: null,
    priority: 'medium',
    status: 'todo',
    createdAt: '2026-10-15T09:00:00Z',
  },
];

describe('utils/format renderTaskTable (US2)', () => {
  it('FR-004: muestra columnas ID, título, estado, prioridad, fecha', () => {
    const out = renderTaskTable(sample);
    expect(out).toContain('ID');
    expect(out).toContain('Título');
    expect(out).toContain('Estado');
    expect(out).toContain('Prioridad');
    expect(out).toContain('Creada');
    expect(out).toContain('Deploy v2');
    expect(out).toContain('Comprar pan');
  });

  it('muestra el id de cada tarea', () => {
    const out = renderTaskTable(sample);
    expect(out).toContain('3');
    expect(out).toContain('1');
  });

  it('mensaje amigable para lista vacía (no tabla vacía)', () => {
    expect(emptyListMessage()).toMatch(/No hay tareas/);
  });
});
