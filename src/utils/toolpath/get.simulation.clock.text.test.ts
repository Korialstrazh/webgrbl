import { describe, expect, it } from 'vitest';
import { getSimulationClockText } from './get.simulation.clock.text';

describe(getSimulationClockText.name, () => {
  it('writes a time under one hour as minutes and seconds, two digits each', () => {
    expect(getSimulationClockText(66)).toBe('01:06');
    expect(getSimulationClockText(0)).toBe('00:00');
  });

  it('rounds to the nearest second, like the job estimate', () => {
    expect(getSimulationClockText(65.99)).toBe('01:06');
    expect(getSimulationClockText(59.4)).toBe('00:59');
  });

  it('writes hours, minutes and seconds from one hour on', () => {
    expect(getSimulationClockText(3600)).toBe('1:00:00');
    expect(getSimulationClockText(3725)).toBe('1:02:05');
  });

  it('writes a negative time as 0', () => {
    expect(getSimulationClockText(-4)).toBe('00:00');
  });
});
