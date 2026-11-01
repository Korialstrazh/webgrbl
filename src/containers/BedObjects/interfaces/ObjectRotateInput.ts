/**
 * What a rotate gesture starts from and where the pointer is now.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObjectTransform } from '../../../utils/project/interfaces/ProjectObjectTransform';
import type { BedMachinePoint } from './BedMachinePoint';

export interface ObjectRotateInput {
  /** The object's placement when the rotate handle was pressed. */
  startTransform: ProjectObjectTransform;
  /** Where the pointer went down, in the machine frame. */
  startPoint: BedMachinePoint;
  /** Where the pointer is now, in the machine frame. */
  point: BedMachinePoint;
  /** Whether the angle snaps to whole steps of 15 degrees (Shift held). */
  isSnapping: boolean;
}
