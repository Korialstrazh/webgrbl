/**
 * Gets the two comment lines at the top of the G-code: title and machine profile.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GcodeContext } from './interfaces/GcodeContext';
import {
  GCODE_APP_NAME,
  GCODE_COMMENT_PREFIX,
  GCODE_HEADER_FIELD_SEPARATOR,
  GCODE_ORIGIN_LABEL,
  GCODE_PROFILE_LABEL,
  GCODE_S_MAX_LABEL,
  GCODE_TITLE_SEPARATOR,
  GCODE_WORD_SEPARATOR,
} from './gcode.constants';

export const getGcodeHeaderLines = (context: GcodeContext): string[] => {
  const titleText: string = [
    `${GCODE_APP_NAME}${GCODE_WORD_SEPARATOR}${context.appVersion}`,
    context.projectName,
    context.createdAtIso,
  ].join(GCODE_TITLE_SEPARATOR);
  const profileText: string = [
    `${GCODE_PROFILE_LABEL}${context.profileName}`,
    `${GCODE_S_MAX_LABEL}${context.sValueMax}`,
    `${GCODE_ORIGIN_LABEL}${context.originCorner}`,
  ].join(GCODE_HEADER_FIELD_SEPARATOR);

  return [`${GCODE_COMMENT_PREFIX}${titleText}`, `${GCODE_COMMENT_PREFIX}${profileText}`];
};
