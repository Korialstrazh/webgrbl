/**
 * A kind of content of one project object that is left out of the job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';
import type { SvgUnsupportedKind } from '../../svg/geometry/svg.shape.constants';

export interface ObjectWarning {
  /** Id of the project object with the content. */
  objectId: ProjectObject['id'];
  /** What kind of content is left out. */
  kind: SvgUnsupportedKind;
}
