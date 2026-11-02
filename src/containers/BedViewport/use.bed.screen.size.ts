/**
 * Tracks the size of the bed view on screen, read when it mounts and whenever it changes size. Zero until then.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { BedScreenSize } from '../../utils/bed/interfaces/BedScreenSize';

const EMPTY_SCREEN_SIZE: BedScreenSize = { widthPx: 0, heightPx: 0 };

export const useBedScreenSize = (viewRef: RefObject<HTMLElement | null>): BedScreenSize => {
  const [screenSize, setScreenSize] = useState<BedScreenSize>(EMPTY_SCREEN_SIZE);

  useLayoutEffect(() => {
    const viewElement: HTMLElement | null = viewRef.current;

    if (!viewElement) {
      return undefined;
    }

    const updateScreenSize = (): void => {
      setScreenSize({ widthPx: viewElement.clientWidth, heightPx: viewElement.clientHeight });
    };
    const resizeObserver: ResizeObserver = new ResizeObserver(updateScreenSize);

    updateScreenSize();
    resizeObserver.observe(viewElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [viewRef]);

  return screenSize;
};
