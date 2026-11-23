import { describe, expect, it } from 'vitest';
import { getDecimalNumberText } from './get.decimal.number.text';

describe('getDecimalNumberText', () => {
  it('reads a comma decimal mark as a dot', () => {
    expect(getDecimalNumberText('12,5')).toBe('12.5');
    expect(getDecimalNumberText('-0,25')).toBe('-0.25');
  });

  it('keeps a dot decimal mark', () => {
    expect(getDecimalNumberText('12.5')).toBe('12.5');
  });

  it('drops spaces and other characters', () => {
    expect(getDecimalNumberText(' 1 000,5 ')).toBe('1000.5');
  });

  it('reads an empty field as empty text', () => {
    expect(getDecimalNumberText(undefined)).toBe('');
  });
});
