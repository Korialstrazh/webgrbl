import { describe, expect, it } from 'vitest';
import { getPreparedGrblLine } from './grbl.line.preparer';

const JOG_LINE = '$J=G91 X1 F100';

describe(getPreparedGrblLine.name, () => {
  it('strips a semicolon comment and whitespace', () => {
    expect(getPreparedGrblLine('G1 X10 Y5 ; move')).toBe('G1X10Y5');
  });

  it('strips parenthesis comments inside a line', () => {
    expect(getPreparedGrblLine('G1 (fast) X1')).toBe('G1X1');
  });

  it('returns undefined for a comment-only line', () => {
    expect(getPreparedGrblLine('(header)')).toBeUndefined();
  });

  it('returns undefined for a blank line', () => {
    expect(getPreparedGrblLine('   ')).toBeUndefined();
  });

  it('keeps the inner text of a dollar command', () => {
    expect(getPreparedGrblLine(JOG_LINE)).toBe(JOG_LINE);
  });

  it('trims a dollar command and keeps its case', () => {
    expect(getPreparedGrblLine('  $rst=*  ')).toBe('$rst=*');
  });

  it('does not change letter case of g-code', () => {
    expect(getPreparedGrblLine('g0 x1')).toBe('g0x1');
  });
});
