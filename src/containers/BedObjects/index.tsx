/**
 * The project objects on the bed and the pointer and key editing of them. With the Select tool a click selects,
 * Shift-click adds or removes, a click on empty bed clears, and a drag moves the selection. With the Move tool a drag
 * that starts anywhere on the bed moves the current selection and never changes it. The one selected object gets
 * handles that scale and turn it. Every drag and handle gesture is held locally while the pointer is down and becomes
 * one transform action, so one undo step, when it comes up. The layer takes keyboard focus for the nudge and delete
 * keys.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useCallback, useMemo, useRef } from 'react';
import type { PointerEvent, ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { PRIMARY_POINTER_BUTTON } from '../../utils/browser/browser.events.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { isObjectOutsideBed } from '../../utils/project/is.object.outside.bed';
import type { AppDispatch } from '../../utils/states/new.store';
import { selectProjectObjects } from '../../utils/states/project.document.state';
import { ProjectSelectionChanged, selectSelectedObjectIds } from '../../utils/states/project.selection.state';
import { BED_TOOL } from '../BedPanel/bed.toolbar.constants';
import { BED_OBJECTS_SURFACE_TEST_ID } from './bed.objects.constants';
import type { BedObjectHandle } from './bed.objects.constants';
import { BedObjectGraphic } from './BedObjectGraphic';
import { getBedHandleSizes } from './get.bed.handle.sizes';
import { getObjectWithDragOffset } from './get.object.with.drag.offset';
import { getObjectWithHandleGesture } from './get.object.with.handle.gesture';
import { getSelectToolPointerDownOutcome } from './get.select.tool.pointer.down.outcome';
import type { BedHandleGestureControls } from './interfaces/BedHandleGestureControls';
import type { BedHandleSizes } from './interfaces/BedHandleSizes';
import type { BedObjectDragControls } from './interfaces/BedObjectDragControls';
import type { BedObjectsKeyDownHandler } from './interfaces/BedObjectsKeyDownHandler';
import type { BedObjectsProps } from './interfaces/BedObjectsProps';
import type { SelectToolPointerDownOutcome } from './interfaces/SelectToolPointerDownOutcome';
import styles from './styles.module.scss';
import { useBedGestureActivity } from './use.bed.gesture.activity';
import { useBedHandleGesture } from './use.bed.handle.gesture';
import { useBedObjectDrag } from './use.bed.object.drag';
import { useBedObjectsKeys } from './use.bed.objects.keys';
import { useBedPixelsPerMm } from './use.bed.pixels.per.mm';

const LAYER_TAB_INDEX = 0;

const isPrimaryPress = (pointerEvent: PointerEvent): boolean => pointerEvent.button === PRIMARY_POINTER_BUTTON;

/** What a Move tool press does: drag the whole selection as it is, with no change to it now or on a click. */
const getMoveToolOutcome = (selectedObjectIds: string[]): SelectToolPointerDownOutcome => ({
  selectionNow: undefined,
  draggedObjectIds: selectedObjectIds,
  selectionAfterClick: undefined,
});

export const BedObjects = ({ dimensions, activeTool }: BedObjectsProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const projectObjects: ProjectObject[] = useSelector(selectProjectObjects);
  const selectedObjectIds: string[] = useSelector(selectSelectedObjectIds);
  const layerRef: RefObject<SVGGElement | null> = useRef<SVGGElement>(null);
  const dragControls: BedObjectDragControls = useBedObjectDrag(layerRef);
  const gestureControls: BedHandleGestureControls = useBedHandleGesture(layerRef, dimensions.heightMm);
  const handleKeyDown: BedObjectsKeyDownHandler = useBedObjectsKeys();
  const pixelsPerMm: number | undefined = useBedPixelsPerMm(layerRef, dimensions);
  const handleSizes: BedHandleSizes = useMemo(() => getBedHandleSizes(pixelsPerMm), [pixelsPerMm]);
  const { startObjectDrag, drag } = dragControls;
  const { startHandleGesture, handleGesture } = gestureControls;
  const isMoveToolActive: boolean = activeTool === BED_TOOL.MOVE;
  const hasSingleSelection: boolean = selectedObjectIds.length === 1;

  useBedGestureActivity(Boolean(drag ?? handleGesture));

  // A press on the bed gives it keyboard focus, so the arrow and Delete keys reach it next.
  const focusLayer = useCallback((): void => {
    layerRef.current?.focus({ preventScroll: true });
  }, []);

  const moveSelectionFromPress = useCallback((pointerEvent: PointerEvent): void => {
    if (selectedObjectIds.length) {
      startObjectDrag(pointerEvent, getMoveToolOutcome(selectedObjectIds));
    }
  }, [selectedObjectIds, startObjectDrag]);

  const handleObjectPointerDown = useCallback((pointerEvent: PointerEvent<SVGGElement>, objectId: string): void => {
    if (!isPrimaryPress(pointerEvent)) {
      return;
    }

    focusLayer();

    if (isMoveToolActive) {
      moveSelectionFromPress(pointerEvent);

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
  }, [dispatch, focusLayer, isMoveToolActive, moveSelectionFromPress, selectedObjectIds, startObjectDrag]);

  const handleHandlePointerDown = useCallback(
    (pointerEvent: PointerEvent<SVGElement>, objectId: string, handle: BedObjectHandle): void => {
      const projectObject: ProjectObject | undefined = projectObjects.find(
        (candidateObject: ProjectObject): boolean => candidateObject.id === objectId,
      );

      if (!projectObject || !isPrimaryPress(pointerEvent)) {
        return;
      }

      focusLayer();
      startHandleGesture(pointerEvent, projectObject, handle);
    },
    [focusLayer, projectObjects, startHandleGesture],
  );

  const handleSurfacePointerDown = (pointerEvent: PointerEvent<SVGRectElement>): void => {
    if (!isPrimaryPress(pointerEvent)) {
      return;
    }

    focusLayer();

    if (isMoveToolActive) {
      moveSelectionFromPress(pointerEvent);

      return;
    }

    if (selectedObjectIds.length) {
      dispatch(new ProjectSelectionChanged({ objectIds: [] }));
    }
  };

  // Only one gesture can hold a pointer, and each handler ignores pointers it does not hold.
  const handlePointerMove = (pointerEvent: PointerEvent<SVGGElement>): void => {
    gestureControls.handleGesturePointerMove(pointerEvent);
    dragControls.handleDragPointerMove(pointerEvent);
  };

  const handlePointerUp = (pointerEvent: PointerEvent<SVGGElement>): void => {
    gestureControls.handleGesturePointerUp(pointerEvent);
    dragControls.handleDragPointerUp(pointerEvent);
  };

  const handlePointerCancel = (pointerEvent: PointerEvent<SVGGElement>): void => {
    gestureControls.handleGesturePointerCancel(pointerEvent);
    dragControls.handleDragPointerCancel(pointerEvent);
  };

  return (
    <g
      ref={layerRef}
      className={styles.bedObjects}
      role="group"
      aria-label={t(DEFAULT.BED_OBJECTS_LABEL)}
      tabIndex={LAYER_TAB_INDEX}
      onKeyDown={handleKeyDown}
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
        const drawnObject: ProjectObject = getObjectWithDragOffset(
          getObjectWithHandleGesture(projectObject, handleGesture),
          dragControls.drag,
        );
        const isSelected: boolean = selectedObjectIds.includes(projectObject.id);

        return (
          <BedObjectGraphic
            key={projectObject.id}
            projectObject={drawnObject}
            bedHeightMm={dimensions.heightMm}
            isSelected={isSelected}
            hasHandles={isSelected && hasSingleSelection}
            isOutsideBed={isObjectOutsideBed(drawnObject, dimensions)}
            handleSizes={handleSizes}
            onPointerDown={handleObjectPointerDown}
            onHandlePointerDown={handleHandlePointerDown}
          />
        );
      })}
    </g>
  );
};
