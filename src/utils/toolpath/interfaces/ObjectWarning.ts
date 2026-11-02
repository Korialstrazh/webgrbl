/**
 * A kind of content of one project object that is left out of the job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';
import type { SvgUnsupportedKind } from '../../svg/geometry/svg.shape.constants';

export interface ObjectWarning {
  /** Id of the project object with the content. */
  objectId: ProjectObject['id'];
  /** What kind of content is left out. */
  kind: SvgUnsupportedKind;
}
