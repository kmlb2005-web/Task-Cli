// Validación de entradas — funciones puras (Constitución IV).
// Devuelven el valor normalizado o lanzan AppError con mensaje claro en español.

import { AppError } from './errors.js';
import { isPriority, isStatus, PRIORITY_VALUES, STATUS_VALUES } from './state-machine.js';

// Título obligatorio: no vacío ni solo espacios (edge case del spec).
export function validateTitle(raw: string): string {
  const title = raw.trim();
  if (title.length === 0) {
    throw new AppError('El título es obligatorio y no puede estar vacío.');
  }
  return title;
}

// Prioridad opcional: solo high|medium|low; el error lista los valores aceptados.
export function validatePriority(raw: string): 'high' | 'medium' | 'low' {
  if (!isPriority(raw)) {
    throw new AppError(
      `Prioridad inválida: "${raw}". Valores aceptados: ${PRIORITY_VALUES.join(', ')}.`,
    );
  }
  return raw;
}

// Estado destino: solo todo|in-progress|done; el error lista los valores aceptados.
export function validateStatus(raw: string): 'todo' | 'in-progress' | 'done' {
  if (!isStatus(raw)) {
    throw new AppError(
      `Estado inválido: "${raw}". Valores aceptados: ${STATUS_VALUES.join(', ')}.`,
    );
  }
  return raw;
}

// ID de tarea: entero positivo.
export function validateId(raw: string | number): number {
  const id = typeof raw === 'number' ? raw : Number.parseInt(raw, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`ID inválido: "${raw}". Debe ser un número entero positivo.`);
  }
  return id;
}
