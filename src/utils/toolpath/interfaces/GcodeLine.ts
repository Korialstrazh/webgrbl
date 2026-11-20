/**
 * One written G-code line and the toolpath move it carries out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface GcodeLine {
  /** Text of the line, without the line separator. */
  text: string;
  /** Index of the toolpath move the line carries out, or undefined for header, mode and air lines. */
  moveIndex: number | undefined;
}
