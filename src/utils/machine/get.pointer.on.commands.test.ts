import { describe, expect, it } from 'vitest';
import { getPointerOnCommands } from './get.pointer.on.commands';

const S_VALUE_MAX = 1000;

describe(getPointerOnCommands.name, () => {
  it('1 percent of 1000 gives S10 and the pointer feed', () => {
    expect(getPointerOnCommands(1, S_VALUE_MAX)).toEqual(['M3 S10', 'G1 F100']);
  });

  it('9 percent clamps to 5 percent', () => {
    expect(getPointerOnCommands(9, S_VALUE_MAX)).toEqual(['M3 S50', 'G1 F100']);
  });

  it('0.01 percent clamps to 0.1 percent', () => {
    expect(getPointerOnCommands(0.01, S_VALUE_MAX)).toEqual(['M3 S1', 'G1 F100']);
  });

  it('a small S value maximum still gives at least S1', () => {
    expect(getPointerOnCommands(1, 10)).toEqual(['M3 S1', 'G1 F100']);
  });
});
