/**
 * The sanitised SVG text of one project object, stored apart from the project so autosave never rewrites it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface StoredSvgAsset {
  /** Id of the object the SVG belongs to; with the project id it forms the primary key. */
  objectId: string;
  /** Id of the project that holds the object. */
  projectId: string;
  /** Sanitised SVG text. */
  svgText: string;
}
