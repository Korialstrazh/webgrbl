/**
 * One SVG path command with the values of one argument group, as read from the path data.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
