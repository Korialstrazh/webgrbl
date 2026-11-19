/**
 * Props of the element tree of one object.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../../../utils/project/interfaces/ProjectObject';

export interface ObjectElementTreeProps {
  /** The object whose SVG structure is listed. */
  projectObject: ProjectObject;
}
