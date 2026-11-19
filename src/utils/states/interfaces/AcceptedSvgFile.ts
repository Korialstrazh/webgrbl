/**
 * One file that passed the SVG import checks and waits to become a project object.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SanitizedSvg } from '../../svg/interfaces/SanitizedSvg';

export interface AcceptedSvgFile {
  /** Name of the file as the user picked it. */
  fileName: string;
  /** The cleaned SVG and its size. */
  svg: SanitizedSvg;
}
