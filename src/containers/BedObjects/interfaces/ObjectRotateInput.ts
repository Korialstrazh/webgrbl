/**
 * What a rotate gesture starts from and where the pointer is now.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
