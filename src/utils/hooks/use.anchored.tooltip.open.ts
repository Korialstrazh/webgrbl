/**
 * Keeps a hover-and-focus tooltip tied to its trigger: it opens as antd asks, and closes when the trigger is clicked
 * or whenever anything scrolls or the window resizes, so a tooltip never stays behind, floating away from its trigger,
 * once the layout under it moves.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useEffect, useState } from 'react';
import { RESIZE_EVENT_NAME, SCROLL_EVENT_NAME } from '../browser/browser.events.constants';
import type { AnchoredTooltipOpen } from './interfaces/AnchoredTooltipOpen';

export const useAnchoredTooltipOpen = (): AnchoredTooltipOpen => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const close = (): void => setIsOpen(false);

    // Capture, so a scroll of any panel closes it, not only a scroll of the window.
    window.addEventListener(SCROLL_EVENT_NAME, close, true);
    window.addEventListener(RESIZE_EVENT_NAME, close);

    return () => {
      window.removeEventListener(SCROLL_EVENT_NAME, close, true);
      window.removeEventListener(RESIZE_EVENT_NAME, close);
    };
  }, [isOpen]);

  return { isOpen, setIsOpen, close: () => setIsOpen(false) };
};
