/**
 * The project objects on the bed and the pointer and key editing of them. A click selects, Shift-click adds or
 * removes, a click on empty bed clears, and a drag moves the selection. When the user switched it on, a double-click on
 * empty bed moves the laser there; a double-click on an object never does. The one selected object gets
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
import { useCallback, useMemo, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent, ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getDesignLayerLooks } from '../../utils/bed/get.design.layer.looks';
import type { DesignLayerLooks } from '../../utils/bed/interfaces/DesignLayerLooks';
import { PRIMARY_POINTER_BUTTON } from '../../utils/browser/browser.events.constants';
import type { ProjectLayer } from '../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { isObjectArtworkOutsideBed } from '../../utils/project/is.object.artwork.outside.bed';
import type { AppDispatch } from '../../utils/states/new.store';
import { selectProjectLayers, selectProjectObjects } from '../../utils/states/project.document.state';
import { ProjectSelectionChanged, selectSelectedObjectIds } from '../../utils/states/project.selection.state';
import { BED_OBJECTS_LAYER_ID, BED_OBJECTS_SURFACE_TEST_ID } from './bed.objects.constants';
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
import { useBedDoubleClickMove } from './use.bed.double.click.move';
import { useBedGestureActivity } from './use.bed.gesture.activity';
import { useBedHandleGesture } from './use.bed.handle.gesture';
import { useBedObjectDrag } from './use.bed.object.drag';
import { useBedObjectsKeys } from './use.bed.objects.keys';
import { useBedPixelsPerMm } from './use.bed.pixels.per.mm';

const LAYER_TAB_INDEX = 0;

const isPrimaryPress = (pointerEvent: PointerEvent): boolean => pointerEvent.button === PRIMARY_POINTER_BUTTON;

export const BedObjects = ({ dimensions }: BedObjectsProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const projectObjects: ProjectObject[] = useSelector(selectProjectObjects);
  const selectedObjectIds: string[] = useSelector(selectSelectedObjectIds);
  const projectLayers: ProjectLayer[] = useSelector(selectProjectLayers);
  const layerLooks: DesignLayerLooks = useMemo(() => getDesignLayerLooks(projectLayers), [projectLayers]);
  const layerRef: RefObject<SVGGElement | null> = useRef<SVGGElement>(null);
  const dragControls: BedObjectDragControls = useBedObjectDrag(layerRef);
  const gestureControls: BedHandleGestureControls = useBedHandleGesture(layerRef, dimensions.heightMm);
  const handleKeyDown: BedObjectsKeyDownHandler = useBedObjectsKeys();
  const pixelsPerMm: number | undefined = useBedPixelsPerMm(layerRef, dimensions);
  const handleBedDoubleClick: (mouseEvent: MouseEvent<SVGElement>) => void =
    useBedDoubleClickMove(layerRef, dimensions.heightMm);
  const handleSizes: BedHandleSizes = useMemo(() => getBedHandleSizes(pixelsPerMm), [pixelsPerMm]);
  const { startObjectDrag, drag } = dragControls;
  const { startHandleGesture, handleGesture } = gestureControls;
  const hasSingleSelection: boolean = selectedObjectIds.length === 1;

  useBedGestureActivity(Boolean(drag ?? handleGesture));

  // Chrome counts a script focus on an SVG group as keyboard focus, so a press marks it: the bed edge ring is for the
  // keyboard only, and a selection shows on the object alone.
  const [isPointerFocused, setIsPointerFocused] = useState<boolean>(false);

  // A press on the bed gives it keyboard focus, so the arrow and Delete keys reach it next.
  const focusLayer = useCallback((): void => {
    setIsPointerFocused(true);
    layerRef.current?.focus({ preventScroll: true });
  }, []);

  const handleObjectPointerDown = useCallback((pointerEvent: PointerEvent<SVGGElement>, objectId: string): void => {
    if (!isPrimaryPress(pointerEvent)) {
      return;
    }

    focusLayer();

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
  }, [dispatch, focusLayer, selectedObjectIds, startObjectDrag]);

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
      id={BED_OBJECTS_LAYER_ID}
      className={[styles.bedObjects, isPointerFocused ? styles.pointerFocused : undefined].join(' ')}
      role="group"
      aria-label={t(DEFAULT.BED_OBJECTS_LABEL)}
      tabIndex={LAYER_TAB_INDEX}
      onKeyDown={handleKeyDown}
      onBlur={() => setIsPointerFocused(false)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handlePointerCancel}
      // On the whole layer, so a double-click on an object moves the laser there just as one on the empty bed does.
      onDoubleClick={handleBedDoubleClick}
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
            bedWidthMm={dimensions.widthMm}
            bedHeightMm={dimensions.heightMm}
            isSelected={isSelected}
            hasHandles={isSelected && hasSingleSelection}
            isOutsideBed={isObjectArtworkOutsideBed(drawnObject, dimensions)}
            layerLooks={layerLooks}
            handleSizes={handleSizes}
            onPointerDown={handleObjectPointerDown}
            onHandlePointerDown={handleHandlePointerDown}
          />
        );
      })}
    </g>
  );
};
