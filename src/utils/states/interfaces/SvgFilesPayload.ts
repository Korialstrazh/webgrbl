/**
 * What the action that asks for an SVG import carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SvgFilesPayload {
  /** The files the user picked or dropped, in order. */
  files: File[];
}
