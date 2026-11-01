/**
 * Holds a drag of objects on the bed in local state while the pointer is down and makes it one transform action, so one
 * undo step, when it comes up. The pointer is captured so the drag keeps going when it leaves the bed; a cancelled
 * pointer or a lost capture drops the drag without a change.
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
import { useDispatch, useSelector } from 'react-redux';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import type { AppDispatch } from '../../utils/states/new.store';
import { ProjectObjectsTransformed, selectProjectObjects } from '../../utils/states/project.document.state';
import { ProjectSelectionChanged } from '../../utils/states/project.selection.state';
import { getDragAtPointer } from './get.drag.at.pointer';
import { getDraggedObjectTransforms } from './get.dragged.object.transforms';
import { getPointerBedSvgPoint } from './get.pointer.bed.svg.point';
import type { BedObjectDrag } from './interfaces/BedObjectDrag';
import type { BedObjectDragControls } from './interfaces/BedObjectDragControls';
import type { BedSvgPoint } from './interfaces/BedSvgPoint';
import type { SelectToolPointerDownOutcome } from './interfaces/SelectToolPointerDownOutcome';

export const useBedObjectDrag = (layerRef: RefObject<SVGGElement | null>): BedObjectDragControls => {
  const dispatch: AppDispatch = useDispatch();
  const projectObjects: ProjectObject[] = useSelector(selectProjectObjects);
  const [drag, setDrag] = useState<BedObjectDrag | undefined>(undefined);

  const startObjectDrag = useCallback((pointerEvent: PointerEvent, outcome: SelectToolPointerDownOutcome): void => {
    const startPoint: BedSvgPoint | undefined = getPointerBedSvgPoint(layerRef.current, pointerEvent);

    if (!startPoint) {
      return;
    }

    layerRef.current?.setPointerCapture(pointerEvent.pointerId);
    setDrag({
      pointerId: pointerEvent.pointerId,
      objectIds: outcome.draggedObjectIds,
      startClientX: pointerEvent.clientX,
      startClientY: pointerEvent.clientY,
      startPoint,
      offset: { x: 0, y: 0 },
      isMoving: false,
      selectionAfterClick: outcome.selectionAfterClick,
    });
  }, [layerRef]);

  const getDragOfPointer = (pointerEvent: PointerEvent): BedObjectDrag | undefined =>
    drag?.pointerId === pointerEvent.pointerId ? drag : undefined;

  const handleDragPointerMove = (pointerEvent: PointerEvent): void => {
    if (!getDragOfPointer(pointerEvent)) {
      return;
    }

    const point: BedSvgPoint | undefined = getPointerBedSvgPoint(layerRef.current, pointerEvent);

    if (!point) {
      return;
    }

    const { clientX, clientY } = pointerEvent;

    setDrag((currentDrag: BedObjectDrag | undefined) =>
      currentDrag && getDragAtPointer(currentDrag, { clientX, clientY, point }));
  };

  // The drag is finished from where the pointer comes up, so a fast flick that never rendered a move still counts.
  const getFinishedDrag = (pointerEvent: PointerEvent): BedObjectDrag | undefined => {
    const draggedSoFar: BedObjectDrag | undefined = getDragOfPointer(pointerEvent);
    const point: BedSvgPoint | undefined = getPointerBedSvgPoint(layerRef.current, pointerEvent);

    if (!point) {
      return draggedSoFar;
    }

    return draggedSoFar && getDragAtPointer(draggedSoFar, {
      clientX: pointerEvent.clientX,
      clientY: pointerEvent.clientY,
      point,
    });
  };

  const handleDragPointerUp = (pointerEvent: PointerEvent): void => {
    const finishedDrag: BedObjectDrag | undefined = getFinishedDrag(pointerEvent);

    if (!finishedDrag) {
      return;
    }

    setDrag(undefined);

    if (finishedDrag.isMoving) {
      dispatch(new ProjectObjectsTransformed({ transforms: getDraggedObjectTransforms(projectObjects, finishedDrag) }));

      return;
    }

    if (finishedDrag.selectionAfterClick) {
      dispatch(new ProjectSelectionChanged({ objectIds: finishedDrag.selectionAfterClick }));
    }
  };

  const handleDragPointerCancel = (pointerEvent: PointerEvent): void => {
    if (getDragOfPointer(pointerEvent)) {
      setDrag(undefined);
    }
  };

  return { drag, startObjectDrag, handleDragPointerMove, handleDragPointerUp, handleDragPointerCancel };
};
