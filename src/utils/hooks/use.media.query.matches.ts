/**
 * Tells whether the window matches a CSS media query; follows resizes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useEffect, useState } from 'react';
import { CHANGE_EVENT_NAME } from '../browser/browser.events.constants';

export const useMediaQueryMatches = (mediaQuery: string): boolean => {
  const [isMatching, setIsMatching] = useState<boolean>(() => window.matchMedia(mediaQuery).matches);

  useEffect(() => {
    const mediaQueryList: MediaQueryList = window.matchMedia(mediaQuery);
    const handleMediaQueryChange = (changeEvent: MediaQueryListEvent): void => setIsMatching(changeEvent.matches);

    setIsMatching(mediaQueryList.matches);
    mediaQueryList.addEventListener(CHANGE_EVENT_NAME, handleMediaQueryChange);

    return () => mediaQueryList.removeEventListener(CHANGE_EVENT_NAME, handleMediaQueryChange);
  }, [mediaQuery]);

  return isMatching;
};
