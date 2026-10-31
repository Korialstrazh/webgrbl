import { describe, expect, it } from 'vitest';
import { getJogCommand } from './get.jog.command';
import { JOG_DIRECTION } from './machine.command.constants';
import type { JogDirection } from './machine.command.constants';

const STEP_MM = 10;
const FEED_RATE = 1500;

describe(getJogCommand.name, () => {
  it.each([
    [JOG_DIRECTION.NORTH, '$J=G91 G21 Y10 F1500'],
    [JOG_DIRECTION.NORTH_EAST, '$J=G91 G21 X10 Y10 F1500'],
    [JOG_DIRECTION.EAST, '$J=G91 G21 X10 F1500'],
    [JOG_DIRECTION.SOUTH_EAST, '$J=G91 G21 X10 Y-10 F1500'],
    [JOG_DIRECTION.SOUTH, '$J=G91 G21 Y-10 F1500'],
    [JOG_DIRECTION.SOUTH_WEST, '$J=G91 G21 X-10 Y-10 F1500'],
    [JOG_DIRECTION.WEST, '$J=G91 G21 X-10 F1500'],
    [JOG_DIRECTION.NORTH_WEST, '$J=G91 G21 X-10 Y10 F1500'],
  ])('direction %s gives %s', (direction: JogDirection, expected: string) => {
    expect(getJogCommand(direction, STEP_MM, FEED_RATE)).toBe(expected);
  });

  it('0.1 mm diagonal formats cleanly', () => {
    expect(getJogCommand(JOG_DIRECTION.SOUTH_EAST, 0.1, FEED_RATE)).toBe('$J=G91 G21 X0.1 Y-0.1 F1500');
  });
});
