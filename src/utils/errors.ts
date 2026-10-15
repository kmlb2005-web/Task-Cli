// Manejo de errores orientado al usuario (Constitución VI, FR-013/FR-014).
// Nunca se muestran stack traces al usuario; solo mensajes claros y accionables.

export class AppError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 1) {
    super(message);
    this.name = 'AppError';
    this.exitCode = exitCode;
  }
}

// Termina la ejecución con el mensaje dado y código de salida 1 (error).
export function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

// Termina la ejecución con éxito (código 0).
export function succeed(message: string): never {
  process.stdout.write(`${message}\n`);
  process.exit(0);
}
