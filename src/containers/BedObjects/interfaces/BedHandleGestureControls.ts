/**
 * A handle gesture as the objects layer uses it: the gesture in progress, a way to start one, and the pointer handlers
 * that move, finish or drop it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PointerEvent } from 'react';
import type { ProjectObject } from '../../../utils/project/interfaces/ProjectObject';
import type { BedObjectHandle } from '../bed.objects.constants';
import type { BedHandleGesture } from './BedHandleGesture';

export interface BedHandleGestureControls {
  /** The gesture in progress; undefined while no handle is held. */
  handleGesture: BedHandleGesture | undefined;
  /** Starts a gesture on one handle of the object from the pointer's position; stable between renders. */
  startHandleGesture: (pointerEvent: PointerEvent, projectObject: ProjectObject, handle: BedObjectHandle) => void;
  handleGesturePointerMove: (pointerEvent: PointerEvent) => void;
  /** Commits the gesture as one transform. */
  handleGesturePointerUp: (pointerEvent: PointerEvent) => void;
  /** Drops the gesture without a change. */
  handleGesturePointerCancel: (pointerEvent: PointerEvent) => void;
}
