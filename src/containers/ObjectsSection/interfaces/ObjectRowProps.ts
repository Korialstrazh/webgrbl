/**
 * What the object row needs: the object, whether it is selected or outside the bed, and what to do on select and
 * delete.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../../utils/project/interfaces/ProjectObject';

export interface ObjectRowProps {
  projectObject: ProjectObject;
  isSelected: boolean;
  isOutsideBed: boolean;
  onSelect: (objectId: string) => void;
  onDelete: (objectId: string) => void;
}
