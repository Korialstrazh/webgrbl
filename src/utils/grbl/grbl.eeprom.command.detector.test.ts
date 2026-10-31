import { describe, expect, it } from 'vitest';
import { isEepromWritingGrblLine } from './grbl.eeprom.command.detector';

/** Program lines often put a G10, G28.1 or G30.1 after other words or a line number. */
const MID_LINE_EEPROM_WRITES: string[] = ['G90G10L20P1X0Y0', 'N10G10L2P1', 'G90G28.1', 'N5G30.1'];
/** A setting write is only a system command at the start of the line; 28.1 and 30.1 need their G. */
const MID_LINE_LOOK_ALIKES: string[] = ['G1X1$32=1', 'G1X28.1', 'G1X30.1Y10', 'G28.2'];

describe(isEepromWritingGrblLine.name, () => {
  it.each(MID_LINE_EEPROM_WRITES)('detects %s, an EEPROM write after other words', (preparedLine: string) => {
    expect(isEepromWritingGrblLine(preparedLine)).toBe(true);
  });

  it.each(MID_LINE_LOOK_ALIKES)('does not detect the look-alike %s as EEPROM writing', (preparedLine: string) => {
    expect(isEepromWritingGrblLine(preparedLine)).toBe(false);
  });

  it.each(['$32=1', '$N0=G21', '$N1=G21', '$RST=*', '$I=text', 'G10L2P1X0', 'G10L20P1X0', 'g28.1', 'G30.1'])(
    'detects %s as EEPROM writing',
    (preparedLine: string) => {
      expect(isEepromWritingGrblLine(preparedLine)).toBe(true);
    },
  );

  it.each(['$$', '$X', '$I', '$N', 'G1X1', 'G28', 'G10L1', '$J=G91X1F100'])(
    'does not detect %s as EEPROM writing',
    (preparedLine: string) => {
      expect(isEepromWritingGrblLine(preparedLine)).toBe(false);
    },
  );
});
