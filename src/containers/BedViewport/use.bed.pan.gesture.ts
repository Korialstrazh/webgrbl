/**
 * Pans the bed by dragging with the middle mouse button, with the left button while Space (over the bed) or Ctrl
 * (Cmd) is held, or with the left button on empty bed or on any object while nothing is selected. The middle, Space
 * and Ctrl presses are caught before they reach the objects layer; the other left presses still reach it (a click
 * selects or clears, a double-click may move the laser) and only pan once past the drag distance. With a selection, a
 * press on an object never pans, so dragging it keeps its left drag. See getBedPressPanStart.
 * Space only counts while the pointer is over the bed and no text field, overlay or IME composition owns the keyboard;
 * it is then kept from scrolling the page or pressing a focused button.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent, RefObject } from 'react';
import { BED_OBJECT_SELECTOR } from '../../utils/bed/bed.constants';
import {
  BLUR_EVENT_NAME,
  KEYDOWN_EVENT_NAME,
  KEYUP_EVENT_NAME,
  MIDDLE_POINTER_BUTTON,
  SPACE_KEY,
} from '../../utils/browser/browser.events.constants';
import { canShortcutAct } from '../../utils/browser/can.shortcut.act';
import type { BedScreenPoint } from '../../utils/bed/interfaces/BedScreenPoint';
import type { AppStore } from '../../utils/states/new.store';
import { selectSelectedObjectIds } from '../../utils/states/project.selection.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { useAppStore } from '../../utils/states/use.app.store';
import { hasPointerPassedDragStartDistance } from '../BedObjects/has.pointer.passed.drag.start.distance';
import type { PointerPressOrigin } from '../BedObjects/interfaces/PointerPressOrigin';
import { BED_PRESS_PAN_START } from './bed.press.pan.start.constants';
import type { BedPressPanStart } from './bed.press.pan.start.constants';
import { getBedPressPanStart } from './get.bed.press.pan.start';
import type { BedPanGesture } from './interfaces/BedPanGesture';
import type { BedPanStep } from './interfaces/BedPanStep';

const isPressOnBedObject = (pointerEvent: PointerEvent<HTMLElement>): boolean =>
  pointerEvent.target instanceof Element && Boolean(pointerEvent.target.closest(BED_OBJECT_SELECTOR));

// A Space press that readies the pan: over the bed, and not already taken by a focused control such as the playback
// bar, which handles Space itself.
const isBedPanKeyPress = (keyboardEvent: KeyboardEvent, isPointerOverBed: boolean): boolean =>
  keyboardEvent.key === SPACE_KEY && isPointerOverBed && !keyboardEvent.defaultPrevented;

const useSpaceHeldOverBed = (isPointerOverBedRef: RefObject<boolean>): boolean => {
  const store: AppStore = useAppStore();
  const [isSpaceHeld, setIsSpaceHeld] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent): void => {
      const isOverlayOpen: boolean = selectIsAnyOverlayOpen(store.getState());
      const isPanKeyPress: boolean = isBedPanKeyPress(keyboardEvent, isPointerOverBedRef.current);

      if (isPanKeyPress && canShortcutAct(keyboardEvent, isOverlayOpen)) {
        keyboardEvent.preventDefault();
        setIsSpaceHeld(true);
      }
    };
    const handleKeyUp = (keyboardEvent: KeyboardEvent): void => {
      if (keyboardEvent.key === SPACE_KEY) {
        setIsSpaceHeld(false);
      }
    };
    const releaseSpace = (): void => {
      setIsSpaceHeld(false);
    };

    window.addEventListener(KEYDOWN_EVENT_NAME, handleKeyDown);
    window.addEventListener(KEYUP_EVENT_NAME, handleKeyUp);
    window.addEventListener(BLUR_EVENT_NAME, releaseSpace);

    return () => {
      window.removeEventListener(KEYDOWN_EVENT_NAME, handleKeyDown);
      window.removeEventListener(KEYUP_EVENT_NAME, handleKeyUp);
      window.removeEventListener(BLUR_EVENT_NAME, releaseSpace);
    };
  }, [store, isPointerOverBedRef]);

  return isSpaceHeld;
};

export const useBedPanGesture = (panBedBy: BedPanStep): BedPanGesture => {
  const store: AppStore = useAppStore();
  const isPointerOverBedRef = useRef<boolean>(false);
  const lastPointerRef = useRef<BedScreenPoint | undefined>(undefined);
  // A left press on empty bed that has not moved far enough to be a pan yet.
  const pendingPressRef = useRef<PointerPressOrigin | undefined>(undefined);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const isSpaceHeld: boolean = useSpaceHeldOverBed(isPointerOverBedRef);

  const startPan = (pointerEvent: PointerEvent<HTMLElement>, startPoint: BedScreenPoint): void => {
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
    lastPointerRef.current = startPoint;
    setIsPanning(true);
  };

  const onPointerDownCapture = (pointerEvent: PointerEvent<HTMLElement>): void => {
    const panStart: BedPressPanStart = getBedPressPanStart({
      button: pointerEvent.button,
      isSpaceHeld,
      isCtrlHeld: pointerEvent.ctrlKey || pointerEvent.metaKey,
      hasSelection: selectSelectedObjectIds(store.getState()).length > 0,
      isOnObject: isPressOnBedObject(pointerEvent),
    });

    if (panStart === BED_PRESS_PAN_START.AFTER_DRAG) {
      pendingPressRef.current = { startClientX: pointerEvent.clientX, startClientY: pointerEvent.clientY };
    }

    if (panStart === BED_PRESS_PAN_START.IMMEDIATE) {
      pointerEvent.preventDefault();
      pointerEvent.stopPropagation();
      startPan(pointerEvent, { xPx: pointerEvent.clientX, yPx: pointerEvent.clientY });
    }
  };

  const onPointerMove = (pointerEvent: PointerEvent<HTMLElement>): void => {
    const pendingPress: PointerPressOrigin | undefined = pendingPressRef.current;

    if (pendingPress && hasPointerPassedDragStartDistance(pendingPress, pointerEvent.clientX, pointerEvent.clientY)) {
      pendingPressRef.current = undefined;
      startPan(pointerEvent, { xPx: pendingPress.startClientX, yPx: pendingPress.startClientY });
    }

    const lastPointer: BedScreenPoint | undefined = lastPointerRef.current;

    if (!lastPointer) {
      return;
    }

    lastPointerRef.current = { xPx: pointerEvent.clientX, yPx: pointerEvent.clientY };
    panBedBy({ xPx: pointerEvent.clientX - lastPointer.xPx, yPx: pointerEvent.clientY - lastPointer.yPx });
  };

  const onPointerUp = (pointerEvent: PointerEvent<HTMLElement>): void => {
    pendingPressRef.current = undefined;

    if (lastPointerRef.current) {
      lastPointerRef.current = undefined;
      setIsPanning(false);
      pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId);
    }
  };

  return {
    isPanReady: isSpaceHeld,
    isPanning,
    onPointerDownCapture,
    onPointerMove,
    onPointerUp,
    onPointerEnter: (): void => {
      isPointerOverBedRef.current = true;
    },
    onPointerLeave: (): void => {
      isPointerOverBedRef.current = false;
    },
    // A middle press would start the browser's own scroll mode instead of the pan.
    onMouseDownCapture: (mouseEvent: MouseEvent<HTMLElement>): void => {
      if (mouseEvent.button === MIDDLE_POINTER_BUTTON) {
        mouseEvent.preventDefault();
      }
    },
  };
};
