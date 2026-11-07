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
import {
  ConnectionPopoverOpenChanged,
  OverlayClosed,
  OverlayOpened,
  selectDialogOpenCount,
  selectIsAnyDialogOpen,
  selectIsAnyOverlayOpen,
  selectIsConnectionPopoverOpen,
  uiOverlayReducer,
} from './ui.overlay.state';
import type { UiOverlayState } from './ui.overlay.state';
import { OVERLAY_KIND } from './overlay.kind.constants';

const UNKNOWN_ACTION_TYPE = 'unknown action';
const FIRST_OVERLAY_ID = 'dialog-a';
const SECOND_OVERLAY_ID = 'drawer-b';
const NO_OVERLAYS_STATE: UiOverlayState = {
  openOverlayIds: [],
  isConnectionPopoverOpen: false,
  dialogOpenCount: 0,
  openDialogIds: [],
};

class UnknownAction extends Action {
  public static readonly type: string = UNKNOWN_ACTION_TYPE;
}

describe(uiOverlayReducer.name, () => {
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

  it('reports a dialog open only while a dialog, not a popover, is open', () => {
    let state: UiOverlayState = uiOverlayReducer(
      NO_OVERLAYS_STATE,
      new OverlayOpened({ overlayId: SECOND_OVERLAY_ID, overlayKind: OVERLAY_KIND.POPOVER }),
    );

    expect(selectIsAnyDialogOpen({ uiOverlay: state })).toBe(false);

    state = uiOverlayReducer(
      state,
      new OverlayOpened({ overlayId: FIRST_OVERLAY_ID, overlayKind: OVERLAY_KIND.DIALOG }),
    );

    expect(selectIsAnyDialogOpen({ uiOverlay: state })).toBe(true);

    state = uiOverlayReducer(state, new OverlayClosed({ overlayId: FIRST_OVERLAY_ID }));

    expect(selectIsAnyDialogOpen({ uiOverlay: state })).toBe(false);
  });

  it('ignores closing an overlay that is not open', () => {
    const closeAction = new OverlayClosed({ overlayId: FIRST_OVERLAY_ID });
    const state: UiOverlayState = uiOverlayReducer(NO_OVERLAYS_STATE, closeAction);

    expect(state).toBe(NO_OVERLAYS_STATE);
  });

  it('opens and closes the connection popover without touching the overlay registry', () => {
    let state: UiOverlayState = uiOverlayReducer(NO_OVERLAYS_STATE, new OverlayOpened({ overlayId: FIRST_OVERLAY_ID }));
    state = uiOverlayReducer(state, new ConnectionPopoverOpenChanged({ isConnectionPopoverOpen: true }));

    expect(selectIsConnectionPopoverOpen({ uiOverlay: state })).toBe(true);
    expect(state.openOverlayIds).toEqual([FIRST_OVERLAY_ID]);

    state = uiOverlayReducer(state, new ConnectionPopoverOpenChanged({ isConnectionPopoverOpen: false }));

    expect(selectIsConnectionPopoverOpen({ uiOverlay: state })).toBe(false);
  });

  it('closes the connection popover and counts the opening when a dialog opens', () => {
    let state: UiOverlayState = uiOverlayReducer(
      NO_OVERLAYS_STATE,
      new ConnectionPopoverOpenChanged({ isConnectionPopoverOpen: true }),
    );
    state = uiOverlayReducer(
      state,
      new OverlayOpened({ overlayId: FIRST_OVERLAY_ID, overlayKind: OVERLAY_KIND.DIALOG }),
    );

    expect(selectIsConnectionPopoverOpen({ uiOverlay: state })).toBe(false);
    expect(selectDialogOpenCount({ uiOverlay: state })).toBe(1);
  });

  it('keeps the connection popover open when another popover opens', () => {
    let state: UiOverlayState = uiOverlayReducer(
      NO_OVERLAYS_STATE,
      new ConnectionPopoverOpenChanged({ isConnectionPopoverOpen: true }),
    );
    state = uiOverlayReducer(state, new OverlayOpened({ overlayId: SECOND_OVERLAY_ID }));

    expect(selectIsConnectionPopoverOpen({ uiOverlay: state })).toBe(true);
    expect(selectDialogOpenCount({ uiOverlay: state })).toBe(0);
  });
});
