/**
 * Zooms the bed from the keyboard, like the zoom buttons: plus (or equals, the same key without Shift) zooms in, minus
 * zooms out, zero fits the bed to the view. Like the other app shortcuts it does nothing while focus is in a text
 * field, while an overlay is open, during IME composition, or with Ctrl, Cmd or Alt held, which leaves the browser
 * zoom alone.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useEffect } from 'react';
import { BED_ZOOM_STEP_FACTOR } from '../../utils/bed/bed.zoom.constants';
import {
  EQUALS_KEY,
  KEYDOWN_EVENT_NAME,
  MINUS_KEY,
  PLUS_KEY,
  ZERO_KEY,
} from '../../utils/browser/browser.events.constants';
import { canShortcutAct } from '../../utils/browser/can.shortcut.act';
import { hasCtrlMetaOrAltModifier } from '../../utils/browser/has.ctrl.meta.or.alt.modifier';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { useAppStore } from '../../utils/states/use.app.store';
import type { BedZoomStep } from './interfaces/BedZoomStep';

const ZOOM_IN_KEYS: readonly string[] = [PLUS_KEY, EQUALS_KEY];

export const useBedZoomHotkeys = (zoomBedBy: BedZoomStep, fitBedToView: () => void): void => {
  const store: AppStore = useAppStore();

  useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent): void => {
      const isOverlayOpen: boolean = selectIsAnyOverlayOpen(store.getState());

      if (hasCtrlMetaOrAltModifier(keyboardEvent) || !canShortcutAct(keyboardEvent, isOverlayOpen)) {
        return;
      }

      if (ZOOM_IN_KEYS.includes(keyboardEvent.key)) {
        zoomBedBy(BED_ZOOM_STEP_FACTOR);
      } else if (keyboardEvent.key === MINUS_KEY) {
        zoomBedBy(1 / BED_ZOOM_STEP_FACTOR);
      } else if (keyboardEvent.key === ZERO_KEY) {
        fitBedToView();
      }
    };

    window.addEventListener(KEYDOWN_EVENT_NAME, handleKeyDown);

    return () => {
      window.removeEventListener(KEYDOWN_EVENT_NAME, handleKeyDown);
    };
  }, [store, zoomBedBy, fitBedToView]);
};
