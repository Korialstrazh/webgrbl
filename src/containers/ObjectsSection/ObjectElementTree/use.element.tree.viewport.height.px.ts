/**
 * The height the element tree may grow to: a share of the panel that scrolls it, never below a minimum, measured again
 * whenever that panel changes size. Without a ResizeObserver it stays at the default height.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import {
  ELEMENT_TREE_DEFAULT_VIEWPORT_HEIGHT_PX,
  ELEMENT_TREE_MIN_VIEWPORT_HEIGHT_PX,
  ELEMENT_TREE_PANEL_HEIGHT_SHARE,
} from './element.tree.constants';

const SCROLLING_OVERFLOW_PATTERN = /^(auto|scroll|overlay)$/;

const getScrollingAncestor = (element: HTMLElement): HTMLElement | undefined => {
  for (let ancestor: HTMLElement | null = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (SCROLLING_OVERFLOW_PATTERN.test(getComputedStyle(ancestor).overflowY)) {
      return ancestor;
    }
  }

  return undefined;
};

const getViewportHeightPxOfPanel = (panelHeightPx: number): number =>
  Math.max(ELEMENT_TREE_MIN_VIEWPORT_HEIGHT_PX, Math.round(panelHeightPx * ELEMENT_TREE_PANEL_HEIGHT_SHARE));

export const useElementTreeViewportHeightPx = (treeRef: RefObject<HTMLElement | null>): number => {
  const [viewportHeightPx, setViewportHeightPx] = useState<number>(ELEMENT_TREE_DEFAULT_VIEWPORT_HEIGHT_PX);

  useLayoutEffect(() => {
    const treeElement: HTMLElement | null = treeRef.current;
    const panelElement: HTMLElement | undefined = treeElement ? getScrollingAncestor(treeElement) : undefined;
    const canObservePanel: boolean = Boolean(window.ResizeObserver);

    if (!panelElement || !canObservePanel) {
      return undefined;
    }

    const updateViewportHeight = (): void => {
      setViewportHeightPx(getViewportHeightPxOfPanel(panelElement.clientHeight));
    };
    const resizeObserver: ResizeObserver = new ResizeObserver(updateViewportHeight);

    updateViewportHeight();
    resizeObserver.observe(panelElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [treeRef]);

  return viewportHeightPx;
};
