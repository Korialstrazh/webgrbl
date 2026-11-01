/**
 * Holds a scale or rotate gesture on a handle in local state while the pointer is down and makes it one transform
 * action, so one undo step, when it comes up. Like a drag, the pointer is captured, a cancelled pointer or a lost
 * capture drops the gesture, and the final placement comes from where the pointer comes up. Shift is read on every
 * move, so it can be pressed or let go during the gesture.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useCallback, useState } from 'react';
import type { PointerEvent, RefObject } from 'react';
import { useDispatch } from 'react-redux';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import type { ProjectObjectTransform } from '../../utils/project/interfaces/ProjectObjectTransform';
import type { AppDispatch } from '../../utils/states/new.store';
import { ProjectObjectsTransformed } from '../../utils/states/project.document.state';
import type { BedObjectHandle } from './bed.objects.constants';
import { getBedMachinePoint } from './get.bed.machine.point';
import { getHandleGestureTransform } from './get.handle.gesture.transform';
import { getPointerBedSvgPoint } from './get.pointer.bed.svg.point';
import { hasPointerPassedDragStartDistance } from './has.pointer.passed.drag.start.distance';
import type { BedHandleGesture } from './interfaces/BedHandleGesture';
import type { BedHandleGestureControls } from './interfaces/BedHandleGestureControls';
import type { BedMachinePoint } from './interfaces/BedMachinePoint';
import type { BedSvgPoint } from './interfaces/BedSvgPoint';

const getPointerMachinePoint = (
  layerElement: SVGGElement | null,
  pointerEvent: PointerEvent,
  bedHeightMm: number,
): BedMachinePoint | undefined => {
  const svgPoint: BedSvgPoint | undefined = getPointerBedSvgPoint(layerElement, pointerEvent);

  return svgPoint && getBedMachinePoint(svgPoint, bedHeightMm);
};

const getGestureAtPoint = (
  handleGesture: BedHandleGesture,
  pointerEvent: PointerEvent,
  point: BedMachinePoint,
): BedHandleGesture => {
  const isMoving: boolean = handleGesture.isMoving
    || hasPointerPassedDragStartDistance(handleGesture, pointerEvent.clientX, pointerEvent.clientY);

  return isMoving
    ? { ...handleGesture, isMoving, transform: getHandleGestureTransform(handleGesture, point, pointerEvent.shiftKey) }
    : handleGesture;
};

export const useBedHandleGesture = (
  layerRef: RefObject<SVGGElement | null>,
  bedHeightMm: number,
): BedHandleGestureControls => {
  const dispatch: AppDispatch = useDispatch();
  const [handleGesture, setHandleGesture] = useState<BedHandleGesture | undefined>(undefined);

  const startHandleGesture = useCallback(
    (pointerEvent: PointerEvent, projectObject: ProjectObject, handle: BedObjectHandle): void => {
      const startPoint: BedMachinePoint | undefined = getPointerMachinePoint(
        layerRef.current,
        pointerEvent,
        bedHeightMm,
      );

      if (!startPoint) {
        return;
      }

      const { id, xMm, yMm, widthMm, heightMm, rotationDeg }: ProjectObject = projectObject;
      const startTransform: ProjectObjectTransform = { xMm, yMm, widthMm, heightMm, rotationDeg };

      layerRef.current?.setPointerCapture(pointerEvent.pointerId);
      setHandleGesture({
        pointerId: pointerEvent.pointerId,
        objectId: id,
        handle,
        startClientX: pointerEvent.clientX,
        startClientY: pointerEvent.clientY,
        startTransform,
        startPoint,
        transform: startTransform,
        isMoving: false,
      });
    },
    [layerRef, bedHeightMm],
  );

  // The gesture's placement depends only on where it started and where the pointer is, so a gesture state one render
  // behind still gives the right placement.
  const getGestureAtPointer = (pointerEvent: PointerEvent): BedHandleGesture | undefined => {
    if (handleGesture?.pointerId !== pointerEvent.pointerId) {
      return undefined;
    }

    const point: BedMachinePoint | undefined = getPointerMachinePoint(layerRef.current, pointerEvent, bedHeightMm);

    return point ? getGestureAtPoint(handleGesture, pointerEvent, point) : handleGesture;
  };

  const handleGesturePointerMove = (pointerEvent: PointerEvent): void => {
    const movedGesture: BedHandleGesture | undefined = getGestureAtPointer(pointerEvent);

    if (movedGesture) {
      setHandleGesture(movedGesture);
    }
  };

  const handleGesturePointerUp = (pointerEvent: PointerEvent): void => {
    const finishedGesture: BedHandleGesture | undefined = getGestureAtPointer(pointerEvent);

    if (!finishedGesture) {
      return;
    }

    setHandleGesture(undefined);

    if (finishedGesture.isMoving) {
      const { objectId, transform }: BedHandleGesture = finishedGesture;

      dispatch(new ProjectObjectsTransformed({ transforms: { [objectId]: transform } }));
    }
  };

  const handleGesturePointerCancel = (pointerEvent: PointerEvent): void => {
    if (handleGesture?.pointerId === pointerEvent.pointerId) {
      setHandleGesture(undefined);
    }
  };

  return {
    handleGesture,
    startHandleGesture,
    handleGesturePointerMove,
    handleGesturePointerUp,
    handleGesturePointerCancel,
  };
};
