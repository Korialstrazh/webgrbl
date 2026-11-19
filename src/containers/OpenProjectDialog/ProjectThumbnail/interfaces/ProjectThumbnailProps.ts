/**
 * The props of the small drawing of where a stored project's objects sit.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObjectTransform } from '../../../../utils/project/interfaces/ProjectObjectTransform';

export interface ProjectThumbnailProps {
  /** Where each object sits on the bed, in drawing order. */
  objectBoxes: ProjectObjectTransform[];
}
