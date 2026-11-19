/**
 * What the action that asks for an SVG import carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SvgFilesPayload {
  /** The files the user picked or dropped, in order. */
  files: File[];
}
