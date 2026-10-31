import { describe, expect, it } from 'vitest';
import { getGoToWorkZeroCommand } from './get.go.to.work.zero.command';

describe(getGoToWorkZeroCommand.name, () => {
  it('jogs to the work origin at the given feed rate', () => {
    expect(getGoToWorkZeroCommand(1500)).toBe('$J=G90 G21 X0 Y0 F1500');
  });
});
