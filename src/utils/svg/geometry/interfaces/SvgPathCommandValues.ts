/**
 * One SVG path command with the values of one argument group, as read from the path data.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgPathCommand } from '../svg.path.constants';

export interface SvgPathCommandValues {
  /** The command, upper case. */
  command: SvgPathCommand;
  /** True when the command letter was lower case. */
  isRelative: boolean;
  /** The numbers of one argument group; arc flags are 0 or 1. */
  values: number[];
}
