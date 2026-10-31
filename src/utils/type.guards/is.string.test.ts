import { describe, expect, it } from 'vitest';
import { isOptionalString } from './is.optional.string';
import { isString } from './is.string';

describe(isString.name, () => {
  it('accepts only strings', () => {
    expect(isString('')).toBe(true);
    expect(isString(5)).toBe(false);
    expect(isString(undefined)).toBe(false);
  });
});

describe(isOptionalString.name, () => {
  it('accepts a string or undefined only', () => {
    expect(isOptionalString('a')).toBe(true);
    expect(isOptionalString(undefined)).toBe(true);
    expect(isOptionalString(null)).toBe(false);
    expect(isOptionalString(1)).toBe(false);
  });
});
