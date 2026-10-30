/**
 * Cleans a raw program or console line into the text that is sent to the controller.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  GRBL_LINE_COMMENT_PATTERN,
  GRBL_SYSTEM_COMMAND_PREFIX,
  GRBL_WHITESPACE_PATTERN,
} from './grbl.constants';

export const getPreparedGrblLine = (rawLine: string): string | undefined => {
  const uncommentedLine: string = rawLine.replace(GRBL_LINE_COMMENT_PATTERN, '').trim();
  const preparedLine: string = uncommentedLine.startsWith(GRBL_SYSTEM_COMMAND_PREFIX)
    ? uncommentedLine
    : uncommentedLine.replace(GRBL_WHITESPACE_PATTERN, '');

  return preparedLine || undefined;
};
