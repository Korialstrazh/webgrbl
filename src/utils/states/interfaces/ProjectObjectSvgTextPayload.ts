/**
 * Asks to replace the SVG text of one object after an edit in its element tree.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';

export interface ProjectObjectSvgTextPayload {
  /** Id of the edited object. */
  objectId: ProjectObject['id'];
  /** The object's new SVG text. */
  svgText: ProjectObject['svgText'];
}
