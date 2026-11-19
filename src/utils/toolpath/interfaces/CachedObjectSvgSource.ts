/**
 * The parsed SVG of one project object, with the SVG text it was parsed from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';
import type { ObjectSvgSource } from './ObjectSvgSource';

export interface CachedObjectSvgSource {
  /** The SVG text the entry was parsed from; a different text means the entry is out of date. */
  svgText: ProjectObject['svgText'];
  /** The parsed SVG. */
  svgSource: ObjectSvgSource;
}
