import { describe, expect, it } from 'vitest';
import { isMachineOriginCorner } from './is.machine.origin.corner';
import { MACHINE_ORIGIN_CORNER } from './machine.profile.constants';

describe(isMachineOriginCorner.name, () => {
  it.each(Object.values(MACHINE_ORIGIN_CORNER))('accepts %s', (corner: string) => {
    expect(isMachineOriginCorner(corner)).toBe(true);
  });

  it.each([['middle'], [''], [undefined], [5]])('rejects %j', (value: unknown) => {
    expect(isMachineOriginCorner(value)).toBe(false);
  });
});
