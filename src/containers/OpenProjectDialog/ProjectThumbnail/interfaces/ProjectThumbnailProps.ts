/**
 * The props of the small drawing of where a stored project's objects sit.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObjectTransform } from '../../../../utils/project/interfaces/ProjectObjectTransform';

export interface ProjectThumbnailProps {
  /** Where each object sits on the bed, in drawing order. */
  objectBoxes: ProjectObjectTransform[];
}
