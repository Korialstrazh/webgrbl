/**
 * Tells whether a prepared line writes the controller EEPROM, which GRBL only accepts while nothing else is in flight.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_EEPROM_COMMAND_PATTERN } from './grbl.constants';

export const isEepromWritingGrblLine = (preparedLine: string): boolean =>
  GRBL_EEPROM_COMMAND_PATTERN.test(preparedLine);
