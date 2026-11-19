/**
 * What the object row needs: the object, whether it is selected or outside the bed, and what to do on select and
 * delete.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../../utils/project/interfaces/ProjectObject';

export interface ObjectRowProps {
  projectObject: ProjectObject;
  isSelected: boolean;
  isOutsideBed: boolean;
  onSelect: (objectId: string) => void;
  onDelete: (objectId: string) => void;
}
