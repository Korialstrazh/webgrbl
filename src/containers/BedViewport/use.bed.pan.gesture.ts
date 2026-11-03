/**
 * Pans the bed by dragging with the middle mouse button, or with the left button while Space is held over the bed. The
 * press is caught before it reaches the objects layer, so selecting and dragging keep their left drag.
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
import {
  BLUR_EVENT_NAME,
  KEYDOWN_EVENT_NAME,
  KEYUP_EVENT_NAME,
  MIDDLE_POINTER_BUTTON,
  PRIMARY_POINTER_BUTTON,
  SPACE_KEY,
} from '../../utils/browser/browser.events.constants';
import { canShortcutAct } from '../../utils/browser/can.shortcut.act';
import type { BedScreenPoint } from '../../utils/bed/interfaces/BedScreenPoint';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { useAppStore } from '../../utils/states/use.app.store';
import type { BedPanGesture } from './interfaces/BedPanGesture';
import type { BedPanStep } from './interfaces/BedPanStep';

const isPanPress = (button: number, isSpaceHeld: boolean): boolean =>
  button === MIDDLE_POINTER_BUTTON || (button === PRIMARY_POINTER_BUTTON && isSpaceHeld);

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
  const isPointerOverBedRef = useRef<boolean>(false);
  const lastPointerRef = useRef<BedScreenPoint | undefined>(undefined);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const isSpaceHeld: boolean = useSpaceHeldOverBed(isPointerOverBedRef);

  const onPointerDownCapture = (pointerEvent: PointerEvent<HTMLElement>): void => {
    if (!isPanPress(pointerEvent.button, isSpaceHeld)) {
      return;
    }

    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
    lastPointerRef.current = { xPx: pointerEvent.clientX, yPx: pointerEvent.clientY };
    setIsPanning(true);
  };

  const onPointerMove = (pointerEvent: PointerEvent<HTMLElement>): void => {
    const lastPointer: BedScreenPoint | undefined = lastPointerRef.current;

    if (!lastPointer) {
      return;
    }

    lastPointerRef.current = { xPx: pointerEvent.clientX, yPx: pointerEvent.clientY };
    panBedBy({ xPx: pointerEvent.clientX - lastPointer.xPx, yPx: pointerEvent.clientY - lastPointer.yPx });
  };

  const onPointerUp = (pointerEvent: PointerEvent<HTMLElement>): void => {
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
