/**
 * The parsed SVG of one project object, with the SVG text it was parsed from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';
import type { ObjectSvgSource } from './ObjectSvgSource';

export interface CachedObjectSvgSource {
  /** The SVG text the entry was parsed from; a different text means the entry is out of date. */
  svgText: ProjectObject['svgText'];
  /** The parsed SVG. */
  svgSource: ObjectSvgSource;
}
