/**
 * Tells whether the window is wide enough for the side-by-side workbench; follows resizes.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect, useState } from 'react';
import { CHANGE_EVENT_NAME } from '../browser/browser.events.constants';
import { WIDE_LAYOUT_MEDIA_QUERY } from '../layout.constants';

export const useIsWideLayout = (): boolean => {
  const [isWide, setIsWide] = useState<boolean>(() => window.matchMedia(WIDE_LAYOUT_MEDIA_QUERY).matches);

  useEffect(() => {
    const mediaQueryList: MediaQueryList = window.matchMedia(WIDE_LAYOUT_MEDIA_QUERY);
    const handleMediaQueryChange = (changeEvent: MediaQueryListEvent): void => setIsWide(changeEvent.matches);

    setIsWide(mediaQueryList.matches);
    mediaQueryList.addEventListener(CHANGE_EVENT_NAME, handleMediaQueryChange);

    return () => mediaQueryList.removeEventListener(CHANGE_EVENT_NAME, handleMediaQueryChange);
  }, []);

  return isWide;
};
