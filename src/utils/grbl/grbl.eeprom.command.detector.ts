/**
 * Tells whether a prepared line writes the controller EEPROM, which GRBL only accepts while nothing else is in flight.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { GRBL_EEPROM_COMMAND_PATTERN } from './grbl.constants';

export const isEepromWritingGrblLine = (preparedLine: string): boolean =>
  GRBL_EEPROM_COMMAND_PATTERN.test(preparedLine);
