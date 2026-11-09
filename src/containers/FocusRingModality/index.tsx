/**
 * The one focus ring rule of the app: after a pointer press, focus that an overlay hands back as it closes draws no
 * ring, so a control never looks selected or in error after a popover, drawer or dialog opened with the mouse or a
 * touch closes, even when Escape closed it. Any other key brings the ring back for keyboard users. It marks the root
 * element, which the global focus ring rule reads. Renders nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ESCAPE_KEY, KEYDOWN_EVENT_NAME, POINTER_DOWN_EVENT_NAME } from '../../utils/browser/browser.events.constants';
import { POINTER_MODALITY_ATTRIBUTE } from './focus.ring.modality.constants';

const USE_CAPTURE_PHASE = true;

const markPointerModality = (): void => {
  document.documentElement.setAttribute(POINTER_MODALITY_ATTRIBUTE, '');
};

// Escape only closes what the pointer opened, so it keeps the pointer look; every other key is keyboard use.
const markKeyboardModality = (event: KeyboardEvent): void => {
  if (event.key !== ESCAPE_KEY) {
    document.documentElement.removeAttribute(POINTER_MODALITY_ATTRIBUTE);
  }
};

export const FocusRingModality = (): ReactNode => {
  useEffect(() => {
    document.addEventListener(POINTER_DOWN_EVENT_NAME, markPointerModality, USE_CAPTURE_PHASE);
    document.addEventListener(KEYDOWN_EVENT_NAME, markKeyboardModality, USE_CAPTURE_PHASE);

    return (): void => {
      document.removeEventListener(POINTER_DOWN_EVENT_NAME, markPointerModality, USE_CAPTURE_PHASE);
      document.removeEventListener(KEYDOWN_EVENT_NAME, markKeyboardModality, USE_CAPTURE_PHASE);
      document.documentElement.removeAttribute(POINTER_MODALITY_ATTRIBUTE);
    };
  }, []);

  return null;
};
