/**
 * A scale or rotate gesture on a handle of the selected object that is still in progress, kept locally until the
 * pointer comes up.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObjectTransform } from '../../../utils/project/interfaces/ProjectObjectTransform';
import type { BedObjectHandle } from '../bed.objects.constants';
import type { BedMachinePoint } from './BedMachinePoint';
import type { PointerPressOrigin } from './PointerPressOrigin';

export interface BedHandleGesture extends PointerPressOrigin {
  /** The pointer that pressed the handle; other pointers are ignored. */
  pointerId: number;
  /** The object the handle belongs to. */
  objectId: string;
  /** The handle pressed, which decides between scaling around a corner and turning. */
  handle: BedObjectHandle;
  /** The object's placement when the handle was pressed. */
  startTransform: ProjectObjectTransform;
  /** Where the pointer went down, in the machine frame. */
  startPoint: BedMachinePoint;
  /** The placement the gesture gives so far; it is drawn while the pointer is down and committed when it comes up. */
  transform: ProjectObjectTransform;
  /** Whether the pointer has travelled far enough to count as a drag rather than a click. */
  isMoving: boolean;
}
