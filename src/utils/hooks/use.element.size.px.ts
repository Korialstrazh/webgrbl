/**
 * Tracks the size of an element on screen, read when it mounts and whenever it changes size. Zero until then.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { ElementSizePx } from './interfaces/ElementSizePx';

const EMPTY_ELEMENT_SIZE: ElementSizePx = { widthPx: 0, heightPx: 0 };

export const useElementSizePx = (elementRef: RefObject<HTMLElement | null>): ElementSizePx => {
  const [elementSize, setElementSize] = useState<ElementSizePx>(EMPTY_ELEMENT_SIZE);

  useLayoutEffect(() => {
    const element: HTMLElement | null = elementRef.current;

    if (!element) {
      return undefined;
    }

    const updateElementSize = (): void => {
      setElementSize({ widthPx: element.offsetWidth, heightPx: element.offsetHeight });
    };
    const resizeObserver: ResizeObserver = new ResizeObserver(updateElementSize);

    updateElementSize();
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [elementRef]);

  return elementSize;
};
