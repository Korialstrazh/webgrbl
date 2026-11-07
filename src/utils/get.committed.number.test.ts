import { describe, expect, it } from 'vitest';
import { getCommittedNumber } from './get.committed.number';

describe('getCommittedNumber', () => {
  it('commits nothing for a cleared field', () => {
    expect(getCommittedNumber(null, 0, 10)).toBeUndefined();
    expect(getCommittedNumber(undefined, 0, 10)).toBeUndefined();
  });

  it('commits a number inside the limits as typed', () => {
    expect(getCommittedNumber(7, 0, 10)).toBe(7);
  });

  it('holds a number outside the limits at the nearer limit', () => {
    expect(getCommittedNumber(-2, 0, 10)).toBe(0);
    expect(getCommittedNumber(42, 0, 10)).toBe(10);
  });

  it('commits any number without limits', () => {
    expect(getCommittedNumber(-1e6)).toBe(-1e6);
  });
});
