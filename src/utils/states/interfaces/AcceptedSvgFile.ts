/**
 * One file that passed the SVG import checks and waits to become a project object.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SanitizedSvg } from '../../svg/interfaces/SanitizedSvg';

export interface AcceptedSvgFile {
  /** Name of the file as the user picked it. */
  fileName: string;
  /** The cleaned SVG and its size. */
  svg: SanitizedSvg;
}
