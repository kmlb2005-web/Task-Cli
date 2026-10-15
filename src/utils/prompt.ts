// Confirmación de borrado (US5). Usa node:readline/promises — sin dependencias
// extra (Constitución VIII, research.md Decisión 6).

import { createInterface } from 'node:readline/promises';

export const NOT_INTERACTIVE = Symbol('not-interactive');

// Pregunta y devuelve true si el usuario confirma (y/yes/sí/s). En stdin no
// interactivo devuelve NOT_INTERACTIVE en vez de bloquear (p. ej. pipes/CI).
// Nota: con stdin redirigido o en pipe, isTTY es undefined (no false), por lo
// que solo se trata como interactivo cuando isTTY === true (research.md Decisión 6).
export async function confirm(
  question: string,
  input: NodeJS.ReadableStream = process.stdin,
  output: NodeJS.WritableStream = process.stdout,
): Promise<boolean | typeof NOT_INTERACTIVE> {
  if ((input as NodeJS.ReadStream).isTTY !== true) {
    return NOT_INTERACTIVE;
  }

  const rl = createInterface({ input, output });
  try {
    const answer = (await rl.question(`${question} [y/N] `)).trim().toLowerCase();
    return answer === 'y' || answer === 'yes' || answer === 's' || answer === 'sí';
  } finally {
    rl.close();
  }
}
