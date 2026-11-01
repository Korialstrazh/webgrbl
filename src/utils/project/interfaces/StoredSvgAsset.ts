/**
 * The sanitised SVG text of one project object, stored apart from the project so autosave never rewrites it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface StoredSvgAsset {
  /** Id of the object the SVG belongs to; the primary key. */
  objectId: string;
  /** Id of the project that holds the object. */
  projectId: string;
  /** Sanitised SVG text. */
  svgText: string;
}
