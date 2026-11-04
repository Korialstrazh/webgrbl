import { describe, expect, it } from 'vitest';
import { getFrameSValue } from './get.frame.s.value';

describe(getFrameSValue.name, () => {
  it('gives the dot power as a share of the S max', () => {
    expect(getFrameSValue(10, 1000)).toBe(5);
  });

  it('rounds up to 1 instead of down to 0', () => {
    expect(getFrameSValue(100, 100)).toBe(1);
  });

  it('caps at the S max for a laser weaker than the dot', () => {
    expect(getFrameSValue(0.01, 1000)).toBe(1000);
  });
});
