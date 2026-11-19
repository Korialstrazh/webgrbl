/**
 * Lets Escape close the narrow console bottom sheet. The sheet registers as an open overlay, so the Escape-to-STOP
 * hotkey leaves the machine alone, and it closes only while it is the top overlay, so a dialog or popover over it
 * takes the Escape first. Whether it is on top is read in the capture phase, before a dialog's own Escape handler can
 * close that dialog and drop it from the registry; the sheet then closes in the bubble phase.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { ESCAPE_KEY, KEYDOWN_EVENT_NAME } from '../../../utils/browser/browser.events.constants';
import { useOverlayRegistration } from '../../../utils/hooks/use.overlay.registration';
import type { AppRootState, AppStore } from '../../../utils/states/new.store';
import { ConsoleOpenChanged } from '../../../utils/states/panel.layout.state';
import { selectTopOverlayId } from '../../../utils/states/ui.overlay.state';
import { useAppStore } from '../../../utils/states/use.app.store';
import { CONSOLE_SHEET_OVERLAY_ID } from './console.dock.constants';

const USE_CAPTURE_PHASE = true;

const isFreshEscapePress = (event: KeyboardEvent): boolean =>
  event.key === ESCAPE_KEY && !event.repeat && !event.isComposing;

const isEscapeForTopSheet = (event: KeyboardEvent, state: AppRootState, sheetOverlayId: string): boolean =>
  isFreshEscapePress(event) && selectTopOverlayId(state) === sheetOverlayId;

export const useConsoleSheetEscape = (isSheet: boolean): void => {
  const store: AppStore = useAppStore();
  const overlayId: string = useOverlayRegistration(CONSOLE_SHEET_OVERLAY_ID, isSheet);
  const isTopAtPressRef: RefObject<boolean> = useRef<boolean>(false);

  useEffect(() => {
    if (!isSheet) {
      return undefined;
    }

    const handleKeyDownCapture = (event: KeyboardEvent): void => {
      isTopAtPressRef.current = isEscapeForTopSheet(event, store.getState(), overlayId);
    };
    const handleKeyDown = (): void => {
      if (isTopAtPressRef.current) {
        isTopAtPressRef.current = false;
        store.dispatch(new ConsoleOpenChanged({ isConsoleOpen: false }));
      }
    };

    window.addEventListener(KEYDOWN_EVENT_NAME, handleKeyDownCapture, USE_CAPTURE_PHASE);
    window.addEventListener(KEYDOWN_EVENT_NAME, handleKeyDown);

    return () => {
      window.removeEventListener(KEYDOWN_EVENT_NAME, handleKeyDownCapture, USE_CAPTURE_PHASE);
      window.removeEventListener(KEYDOWN_EVENT_NAME, handleKeyDown);
    };
  }, [store, overlayId, isSheet]);
};
