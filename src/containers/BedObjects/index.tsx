/**
 * The project objects on the bed and the pointer editing of them. With the Select tool a click selects, Shift-click
 * adds or removes, a click on empty bed clears, and a drag moves the selection. The drag lives in local state while
 * the pointer is down and becomes one transform action, so one undo step, when it comes up. The pointer is captured so
 * a drag keeps going when it leaves the bed; a cancelled pointer or a lost capture drops the drag without a change.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useRef, useState } from 'react';
import type { PointerEvent, ReactNode, RefObject } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PRIMARY_POINTER_BUTTON } from '../../utils/browser/browser.events.constants';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { isObjectOutsideBed } from '../../utils/project/is.object.outside.bed';
import type { AppDispatch } from '../../utils/states/new.store';
import { ProjectObjectsTransformed, selectProjectObjects } from '../../utils/states/project.document.state';
import { ProjectSelectionChanged, selectSelectedObjectIds } from '../../utils/states/project.selection.state';
import { BED_TOOL } from '../BedPanel/bed.toolbar.constants';
import { BED_OBJECTS_SURFACE_TEST_ID } from './bed.objects.constants';
import { BedObjectGraphic } from './BedObjectGraphic';
import { getBedSvgPoint } from './get.bed.svg.point';
import { getDragAtPointer } from './get.drag.at.pointer';
import { getDraggedObjectTransforms } from './get.dragged.object.transforms';
import { getObjectWithDragOffset } from './get.object.with.drag.offset';
import { getSelectToolPointerDownOutcome } from './get.select.tool.pointer.down.outcome';
import type { BedObjectDrag } from './interfaces/BedObjectDrag';
import type { BedObjectsProps } from './interfaces/BedObjectsProps';
import type { BedSvgPoint } from './interfaces/BedSvgPoint';
import type { SelectToolPointerDownOutcome } from './interfaces/SelectToolPointerDownOutcome';
import styles from './styles.module.scss';

export const BedObjects = ({ dimensions, activeTool }: BedObjectsProps): ReactNode => {
  const dispatch: AppDispatch = useDispatch();
  const projectObjects: ProjectObject[] = useSelector(selectProjectObjects);
  const selectedObjectIds: string[] = useSelector(selectSelectedObjectIds);
  const layerRef: RefObject<SVGGElement | null> = useRef<SVGGElement>(null);
  const [drag, setDrag] = useState<BedObjectDrag | undefined>(undefined);
  const isSelectToolActive: boolean = activeTool === BED_TOOL.SELECT;
  const hasSingleSelection: boolean = selectedObjectIds.length === 1;

  const getPointerBedPoint = (pointerEvent: PointerEvent): BedSvgPoint | undefined => {
    const svgElement: SVGSVGElement | null | undefined = layerRef.current?.ownerSVGElement;

    return svgElement ? getBedSvgPoint(svgElement, pointerEvent.clientX, pointerEvent.clientY) : undefined;
  };

  const getDragOfPointer = (pointerEvent: PointerEvent): BedObjectDrag | undefined =>
    drag?.pointerId === pointerEvent.pointerId ? drag : undefined;

  const startObjectDrag = (pointerEvent: PointerEvent, outcome: SelectToolPointerDownOutcome): void => {
    const startPoint: BedSvgPoint | undefined = getPointerBedPoint(pointerEvent);

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
  };

  const handleObjectPointerDown = (pointerEvent: PointerEvent<SVGGElement>, objectId: string): void => {
    if (pointerEvent.button !== PRIMARY_POINTER_BUTTON) {
      return;
    }

    if (!isSelectToolActive) {
      return;
    }

    const outcome: SelectToolPointerDownOutcome = getSelectToolPointerDownOutcome({
      selectedObjectIds,
      objectId,
      isShiftPressed: pointerEvent.shiftKey,
    });

    if (outcome.selectionNow) {
      dispatch(new ProjectSelectionChanged({ objectIds: outcome.selectionNow }));
    }

    if (outcome.draggedObjectIds.length) {
      startObjectDrag(pointerEvent, outcome);
    }
  };

  const handleSurfacePointerDown = (pointerEvent: PointerEvent<SVGRectElement>): void => {
    if (pointerEvent.button !== PRIMARY_POINTER_BUTTON) {
      return;
    }

    if (!isSelectToolActive) {
      return;
    }

    if (selectedObjectIds.length) {
      dispatch(new ProjectSelectionChanged({ objectIds: [] }));
    }
  };

  const handlePointerMove = (pointerEvent: PointerEvent<SVGGElement>): void => {
    if (!getDragOfPointer(pointerEvent)) {
      return;
    }

    const point: BedSvgPoint | undefined = getPointerBedPoint(pointerEvent);

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
    const point: BedSvgPoint | undefined = getPointerBedPoint(pointerEvent);

    if (!point) {
      return draggedSoFar;
    }

    return draggedSoFar && getDragAtPointer(draggedSoFar, {
      clientX: pointerEvent.clientX,
      clientY: pointerEvent.clientY,
      point,
    });
  };

  const handlePointerUp = (pointerEvent: PointerEvent<SVGGElement>): void => {
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

  const handlePointerCancel = (pointerEvent: PointerEvent<SVGGElement>): void => {
    if (getDragOfPointer(pointerEvent)) {
      setDrag(undefined);
    }
  };

  return (
    <g
      ref={layerRef}
      className={styles.bedObjects}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handlePointerCancel}
    >
      <rect
        className={styles.surface}
        data-testid={BED_OBJECTS_SURFACE_TEST_ID}
        x={0}
        y={0}
        width={dimensions.widthMm}
        height={dimensions.heightMm}
        onPointerDown={handleSurfacePointerDown}
      />
      {projectObjects.map((projectObject: ProjectObject) => {
        const drawnObject: ProjectObject = getObjectWithDragOffset(projectObject, drag);
        const isSelected: boolean = selectedObjectIds.includes(projectObject.id);

        return (
          <BedObjectGraphic
            key={projectObject.id}
            projectObject={drawnObject}
            bedHeightMm={dimensions.heightMm}
            isSelected={isSelected}
            hasHandles={isSelected && hasSingleSelection}
            isOutsideBed={isObjectOutsideBed(drawnObject, dimensions)}
            onPointerDown={handleObjectPointerDown}
          />
        );
      })}
    </g>
  );
};
