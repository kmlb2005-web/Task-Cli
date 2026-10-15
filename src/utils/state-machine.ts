// Máquina de estados de tareas — fuente única de verdad (Constitución IV: funciones puras).
// Implementa FR-007 y FR-008 del spec. Ver research.md Decisión 3.

export type Status = 'todo' | 'in-progress' | 'done';
export type Priority = 'high' | 'medium' | 'low';

export const STATUS_VALUES: readonly Status[] = ['todo', 'in-progress', 'done'];
export const PRIORITY_VALUES: readonly Priority[] = ['high', 'medium', 'low'];

// Transiciones permitidas. En particular todo→done está prohibido (FR-008).
const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  todo: ['in-progress'],
  'in-progress': ['done', 'todo'],
  done: ['todo'],
};

export function isStatus(value: string): value is Status {
  return (STATUS_VALUES as readonly string[]).includes(value);
}

export function isPriority(value: string): value is Priority {
  return (PRIORITY_VALUES as readonly string[]).includes(value);
}

// Función pura: ¿se permite la transición de `from` a `to`?
export function canTransition(from: Status, to: Status): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

// Destinos permitidos desde un estado dado (para mensajes de ayuda).
export function allowedTargets(from: Status): Status[] {
  return [...ALLOWED_TRANSITIONS[from]];
}
