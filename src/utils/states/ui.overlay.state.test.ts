/**
 * Tests for the overlay registry state: idempotent open and close, several overlays at once.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { describe, expect, it } from 'vitest';
import { Action } from './action';
import { OverlayClosed, OverlayOpened, selectIsAnyOverlayOpen, uiOverlayReducer } from './ui.overlay.state';
import type { UiOverlayState } from './ui.overlay.state';

const UNKNOWN_ACTION_TYPE = 'unknown action';
const FIRST_OVERLAY_ID = 'dialog-a';
const SECOND_OVERLAY_ID = 'drawer-b';
const NO_OVERLAYS_STATE: UiOverlayState = { openOverlayIds: [] };

class UnknownAction extends Action {
  public static readonly type: string = UNKNOWN_ACTION_TYPE;
}

describe('uiOverlayReducer', () => {
  it('starts with no open overlay', () => {
    expect(uiOverlayReducer(undefined, new UnknownAction())).toEqual(NO_OVERLAYS_STATE);
  });

  it('stays closed after opening twice and closing once', () => {
    let state: UiOverlayState = uiOverlayReducer(NO_OVERLAYS_STATE, new OverlayOpened({ overlayId: FIRST_OVERLAY_ID }));
    state = uiOverlayReducer(state, new OverlayOpened({ overlayId: FIRST_OVERLAY_ID }));
    state = uiOverlayReducer(state, new OverlayClosed({ overlayId: FIRST_OVERLAY_ID }));

    expect(state.openOverlayIds).toEqual([]);
    expect(selectIsAnyOverlayOpen({ uiOverlay: state })).toBe(false);
  });

  it('keeps reporting open while another overlay is still open', () => {
    let state: UiOverlayState = uiOverlayReducer(NO_OVERLAYS_STATE, new OverlayOpened({ overlayId: FIRST_OVERLAY_ID }));
    state = uiOverlayReducer(state, new OverlayOpened({ overlayId: SECOND_OVERLAY_ID }));
    state = uiOverlayReducer(state, new OverlayClosed({ overlayId: FIRST_OVERLAY_ID }));

    expect(state.openOverlayIds).toEqual([SECOND_OVERLAY_ID]);
    expect(selectIsAnyOverlayOpen({ uiOverlay: state })).toBe(true);
  });

  it('ignores closing an overlay that is not open', () => {
    const closeAction = new OverlayClosed({ overlayId: FIRST_OVERLAY_ID });
    const state: UiOverlayState = uiOverlayReducer(NO_OVERLAYS_STATE, closeAction);

    expect(state).toBe(NO_OVERLAYS_STATE);
  });
});
