<!--
Sync Impact Report
==================
- Version change: (nueva) → 1.0.0 (ratificación inicial)
- Modified principles: N/A (primera versión)
- Added sections:
  - Core Principles (10 principios derivados de docs/reglas.md)
  - Stack Tecnológico
  - Flujo de Desarrollo y Quality Gates
  - Governance
- Removed sections: N/A
- Follow-up TODOs: ninguno. Todos los placeholders de la plantilla fueron
  resueltos con valores concretos.
-->

# task-cli Constitution

## Core Principles

### I. TypeScript y Node.js LTS (NON-NEGOTIABLE)

Todo el código del proyecto se escribe en TypeScript y se ejecuta sobre una versión
LTS de Node.js. La ejecución directa se realiza con `tsx` (o herramienta equivalente).
Ningún archivo de código fuente de producción se escribe en JavaScript puro.

**Rationale**: TypeScript LTS aporta tipos verificables en tiempo de compilación y un
runtime estable, evitando regresiones en un CLI que gestiona datos persistentes.

### II. SQLite con better-sqlite3 (NON-NEGOTIABLE)

La persistencia se implementa exclusivamente con SQLite mediante `better-sqlite3`.
La base de datos se almacena en un archivo local en el directorio del usuario:
`~/.task-cli/tasks.db`. No se usará ningún otro motor de base de datos ni ORM.

**Rationale**: Un CLI de tareas necesita almacenamiento local, rápido y sin servidor;
`better-sqlite3` es síncrono, simple y suficiente para este volumen de datos.

### III. Estructura Plana por Funcionalidad

La estructura del proyecto se mantiene simple y plana. No se introduce clean
architecture ni capas excesivas. El código se organiza por funcionalidad en
directorios de primer nivel: `commands/`, `db/`, `utils/`.

**Rationale**: El tamaño del proyecto no justifica abstracciones de arquitectura;
la simplicidad reduce el costo de mantenimiento y la curva de aprendizaje.

### IV. Estilo de Código Funcional

Se usan funciones puras siempre que sea posible; se prefiere el estilo funcional
sobre clases. Convenciones de nombres: `camelCase` para variables y funciones,
`PascalCase` exclusivamente para tipos e interfaces.

**Rationale**: Las funciones puras son más fáciles de testear y componer, alineado
con la escala y naturaleza de un CLI pequeño.

### V. Commander.js como Único Framework de CLI

El parseo de argumentos y el registro de comandos se realizan con `Commander.js`.
No se implementa parseo manual de `argv` ni se adopta otro framework de CLI.

**Rationale**: Commander.js resuelve de forma estándar y probada el parseo de
argumentos, help y errores de uso, evitando código ad hoc.

### VI. Manejo de Errores Orientado al Usuario (NON-NEGOTIABLE)

Nunca se muestran stack traces al usuario final. Los errores se presentan como
mensajes claros y accionables. Códigos de salida obligatorios: `0` para éxito,
`1` para error.

**Rationale**: Un usuario de CLI necesita saber qué falló y cómo actuar; los stack
traces son ruido que expone internals y no sugiere una acción correctiva.

### VII. Testing con Vitest para la Lógica de Negocio

Los tests unitarios se escriben con Vitest. No se exige cobertura mínima, pero toda
lógica de negocio (alta, baja, edición, listado y filtrado de tareas, y la capa `db/`)
debe tener tests antes de considerarse completa.

**Rationale**: La lógica de negocio es el activo crítico del CLI; los tests la
protegen frente a regresiones sin imponer métricas de cobertura artificiales.

### VIII. Dependencias Mínimas y Sin ORMs

No se agregan librerías para resolver cosas que se pueden lograr con pocas líneas de
código. Está prohibido usar ORMs. Cada dependencia nueva debe justificarse por un
ahorro real de esfuerzo o riesgo.

**Rationale**: Menos dependencias implican menor superficie de ataque, installs más
rápidos y menor rotura por actualizaciones en un CLI distribuido vía npm.

### IX. Output de Terminal Legible

Toda salida en terminal debe ser legible por un humano. Los listados se presentan en
formato de tabla (con `cli-table3` o similar). Los colores se reservan exclusivamente
para estados y prioridades; no se usan decorativamente.

**Rationale**: La terminal es la única interfaz del producto; una salida consistente
y escaneable es parte directa de la calidad percibida.

### X. Instalación Global con npm

El paquete debe ser instalable globalmente mediante `npm install -g` y exponer un
binario ejecutable desde cualquier directorio.

**Rationale**: El modo natural de uso de un CLI es global; un binario roto o no
instalable bloquea por completo la adopción del producto.

## Stack Tecnológico

| Área          | Decisión                                        |
| ------------- | ----------------------------------------------- |
| Lenguaje      | TypeScript                                      |
| Runtime       | Node.js LTS                                     |
| Ejecución     | `tsx` (o similar) para ejecución directa        |
| Base de datos | SQLite vía `better-sqlite3` (`~/.task-cli/tasks.db`) |
| Framework CLI | Commander.js                                    |
| Testing       | Vitest                                          |
| Tablas        | `cli-table3` o similar                          |
| Distribución  | `npm install -g` (binario global)               |

## Flujo de Desarrollo y Quality Gates

- Toda lógica de negocio nueva se acompaña de tests unitarios con Vitest antes de
  considerar la tarea terminada.
- Las revisiones de código verifican el cumplimiento de esta constitución; cualquier
  desviación debe justificarse explícitamente en la revisión.
- Las dependencias nuevas se justifican en la descripción de la change; no se
  aceptan ORMs ni librerías que resuelvan problemas triviales.
- La salida de la CLI se revisa manualmente cuando cambia: mensajes de error deben
  ser accionables y los listados deben mantener el formato de tabla.

## Governance

La constitución es la máxima autoridad técnica del proyecto; prevalece sobre
cualquier otra práctica o preferencia individual cuando existe conflicto.

- **Procedimiento de enmienda**: toda modificación se documenta en un commit
  dedicado que actualiza esta constitución, con un incremento de versión según
  las reglas de versionado y un informe de impacto de sincronización.
- **Política de versionado**: versionado semántico MAJOR.MINOR.PATCH.
  - MAJOR: eliminación o redefinición incompatible de principios.
  - MINOR: nuevo principio o sección, o expansión material de la guía.
  - PATCH: aclaraciones, correcciones de redacción o refinamientos no semánticos.
- **Revisión de cumplimiento**: toda revisión de código y todo flujo de trabajo
  Spec Kit debe verificar el cumplimiento de los principios; la complejidad
  añadida debe justificarse explícitamente.

**Version**: 1.0.0 | **Ratified**: 2026-10-15 | **Last Amended**: 2026-10-15
