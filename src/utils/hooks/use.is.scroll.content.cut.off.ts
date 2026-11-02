/**
 * Tells whether a scroll area has content cut off below its visible part, so the area can show a fade at its bottom
 * edge. It is checked when the area mounts, on every scroll, and whenever the area or one of its children changes size.
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
import { SCROLL_EVENT_NAME } from '../browser/browser.events.constants';
import { isScrollContentCutOff } from '../layout/is.scroll.content.cut.off';

export const useIsScrollContentCutOff = (scrollAreaRef: RefObject<HTMLElement | null>): boolean => {
  const [isCutOff, setIsCutOff] = useState<boolean>(false);

  useLayoutEffect(() => {
    const scrollArea: HTMLElement | null = scrollAreaRef.current;

    if (!scrollArea) {
      return undefined;
    }

    const updateIsCutOff = (): void => {
      setIsCutOff(isScrollContentCutOff(scrollArea));
    };
    const resizeObserver: ResizeObserver = new ResizeObserver(updateIsCutOff);

    updateIsCutOff();
    resizeObserver.observe(scrollArea);

    for (const child of scrollArea.children) {
      resizeObserver.observe(child);
    }

    scrollArea.addEventListener(SCROLL_EVENT_NAME, updateIsCutOff, { passive: true });

    return () => {
      resizeObserver.disconnect();
      scrollArea.removeEventListener(SCROLL_EVENT_NAME, updateIsCutOff);
    };
  }, [scrollAreaRef]);

  return isCutOff;
};
