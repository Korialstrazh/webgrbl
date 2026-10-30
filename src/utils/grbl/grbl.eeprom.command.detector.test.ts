import { describe, expect, it } from 'vitest';
import { isEepromWritingGrblLine } from './grbl.eeprom.command.detector';

describe(isEepromWritingGrblLine.name, () => {
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
