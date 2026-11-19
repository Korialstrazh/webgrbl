/**
 * Asks to replace the SVG text of one object after an edit in its element tree.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';

export interface ProjectObjectSvgTextPayload {
  /** Id of the edited object. */
  objectId: ProjectObject['id'];
  /** The object's new SVG text. */
  svgText: ProjectObject['svgText'];
}
