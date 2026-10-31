/**
 * Keyboard and focus behaviour every overlay shares: Escape closes it, Tab can be trapped inside, focus moves in
 * on open and returns to the opener on close.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect, useRef } from 'react';
import type { KeyboardEvent, RefObject } from 'react';

const OVERLAY_KEY = { ESCAPE: 'Escape', TAB: 'Tab' } as const;

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), '
  + 'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface OverlayFocusResult {
  /** Goes on the overlay element so it can take focus and be searched for focusable controls. */
  overlayRef: RefObject<HTMLDivElement | null>;
  /** Goes on the overlay element's onKeyDown. */
  handleOverlayKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

const isEscapeToHandle = (event: { key: string; repeat: boolean; isComposing: boolean }): boolean =>
  event.key === OVERLAY_KEY.ESCAPE && !event.repeat && !event.isComposing;

const getFocusableElements = (overlayElement: HTMLElement): HTMLElement[] =>
  Array.from(overlayElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

const moveFocusInsideTrap = (event: KeyboardEvent<HTMLElement>, overlayElement: HTMLElement): void => {
  const focusableElements: HTMLElement[] = getFocusableElements(overlayElement);
  const firstElement: HTMLElement | undefined = focusableElements[0];
  const lastElement: HTMLElement | undefined = focusableElements[focusableElements.length - 1];

  if (!firstElement || !lastElement) {
    event.preventDefault();
    overlayElement.focus();

    return;
  }

  const activeElement: Element | null = document.activeElement;
  const isLeavingBackwards: boolean =
    event.shiftKey && (activeElement === firstElement || activeElement === overlayElement);
  const isLeavingForwards: boolean = !event.shiftKey && activeElement === lastElement;

  if (isLeavingBackwards) {
    event.preventDefault();
    lastElement.focus();
  } else if (isLeavingForwards) {
    event.preventDefault();
    firstElement.focus();
  }
};

const focusFirstControlOrOverlay = (overlayElement: HTMLElement | null): void => {
  if (!overlayElement) {
    return;
  }

  const firstElement: HTMLElement | undefined = getFocusableElements(overlayElement)[0];

  (firstElement ?? overlayElement).focus();
};

export const useOverlayFocus = (
  isOpen: boolean,
  onClose: () => void,
  isFocusTrapped: boolean,
): OverlayFocusResult => {
  const overlayRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const openerElement: Element | null = document.activeElement;

    focusFirstControlOrOverlay(overlayRef.current);

    return () => {
      if (openerElement instanceof HTMLElement) {
        openerElement.focus();
      }
    };
  }, [isOpen]);

  const onCloseRef: RefObject<() => void> = useRef<() => void>(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    // Focus can leave the overlay (a click on the bed), and Escape must still close it.
    const handleDocumentKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (isEscapeToHandle(event)) {
        event.stopImmediatePropagation();
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleDocumentKeyDown);

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [isOpen]);

  const handleOverlayKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (isEscapeToHandle(event.nativeEvent)) {
      // The global STOP hotkey must never see an Escape that closed an overlay.
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      onClose();
    } else if (event.key === OVERLAY_KEY.TAB && isFocusTrapped && overlayRef.current) {
      moveFocusInsideTrap(event, overlayRef.current);
    }
  };

  return { overlayRef, handleOverlayKeyDown };
};
