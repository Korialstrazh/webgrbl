import { describe, expect, it } from 'vitest';
import { isPrintableAsciiGrblLine } from './grbl.printable.ascii.line';

const SENDABLE_LINES: string[] = ['G1X10F600', '$J=G91 X1 F100', ' ~', ''];
/** Unit separator (0x1F), DEL (0x7F), 0x80, a UTF-8 two-byte character and a tab. */
const UNSENDABLE_LINES: string[] = ['G1X1\u001F', 'G1X1\u007F', 'G1X1\u0080', 'G1X\u00DA', '$J=G91\tX1'];

describe(isPrintableAsciiGrblLine.name, () => {
  it.each(SENDABLE_LINES)('accepts %j', (line: string) => {
    expect(isPrintableAsciiGrblLine(line)).toBe(true);
  });

  it.each(UNSENDABLE_LINES)('refuses %j', (line: string) => {
    expect(isPrintableAsciiGrblLine(line)).toBe(false);
  });
});
