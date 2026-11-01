/**
 * What a scale gesture on a corner handle starts from and how far it has gone.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObjectTransform } from '../../../utils/project/interfaces/ProjectObjectTransform';
import type { BedObjectScaleHandle } from '../bed.objects.constants';
import type { BedMachinePoint } from './BedMachinePoint';

export interface ObjectScaleInput {
  /** The object's placement when the handle was pressed. */
  startTransform: ProjectObjectTransform;
  /** The corner handle dragged; the opposite corner stays where it is. */
  handle: BedObjectScaleHandle;
  /** How far the pointer has moved since the press, in the machine frame. */
  pointerOffset: BedMachinePoint;
  /** Whether width and height change apart (Shift held) instead of keeping the aspect ratio. */
  isAspectRatioFree: boolean;
}
