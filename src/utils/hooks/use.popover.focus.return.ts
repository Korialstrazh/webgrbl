/**
 * Gives the focus back to the control that opened a popover once it closes, so Escape or a click inside never leaves
 * a keyboard user on the page body or on some other control. A control the user moved to on purpose keeps the focus.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { ANTD_POPOVER_SELECTOR } from '../antd.constants';

const isFocusLeftBehind = (): boolean => {
  const { activeElement } = document;

  return !activeElement || activeElement === document.body || Boolean(activeElement.closest(ANTD_POPOVER_SELECTOR));
};

export const usePopoverFocusReturn = (isPopoverOpen: boolean): void => {
  const openerRef: RefObject<HTMLElement | null> = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isPopoverOpen) {
      // The trigger still holds the focus here: the popover moves it inside only after it has opened.
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

      return undefined;
    }

    const openerElement: HTMLElement | null = openerRef.current;

    openerRef.current = null;

    if (!openerElement) {
      return undefined;
    }

    // One frame later, so a control the close itself focused on purpose is seen first.
    const frameId: number = requestAnimationFrame(() => {
      if (isFocusLeftBehind() && openerElement.isConnected) {
        openerElement.focus({ preventScroll: true });
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [isPopoverOpen]);
};
