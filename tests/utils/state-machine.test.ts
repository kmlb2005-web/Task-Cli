// Tests de la máquina de estados (T018, US3). Valida FR-007 y FR-008.

import { describe, expect, it } from 'vitest';
import { canTransition } from '../../src/utils/state-machine.js';

describe('state-machine canTransition (US3)', () => {
  it('permite las 4 transiciones válidas', () => {
    expect(canTransition('todo', 'in-progress')).toBe(true);
    expect(canTransition('in-progress', 'done')).toBe(true);
    expect(canTransition('in-progress', 'todo')).toBe(true);
    expect(canTransition('done', 'todo')).toBe(true);
  });

  it('FR-008: rechaza todo→done (no completar sin in-progress)', () => {
    expect(canTransition('todo', 'done')).toBe(false);
  });

  it('rechaza done→in-progress (spec escenario US3.6)', () => {
    expect(canTransition('done', 'in-progress')).toBe(false);
  });

  it('rechaza transiciones al mismo estado', () => {
    expect(canTransition('todo', 'todo')).toBe(false);
    expect(canTransition('in-progress', 'in-progress')).toBe(false);
    expect(canTransition('done', 'done')).toBe(false);
  });
});
