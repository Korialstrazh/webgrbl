/**
 * Names of the browser events the app listens to on window, document and media query lists, and the values it checks.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

/** Fired before the page unloads; cancelling it asks the user to confirm leaving. */
export const BEFORE_UNLOAD_EVENT_NAME = 'beforeunload';
/** Fired when the browser regains network access. */
export const ONLINE_EVENT_NAME = 'online';
/** Fired when the browser loses network access. */
export const OFFLINE_EVENT_NAME = 'offline';
/** Fired when a key goes down; the Escape-to-STOP hotkey listens for it. */
export const KEYDOWN_EVENT_NAME = 'keydown';
/** Fired on an element when the mouse wheel or a trackpad scrolls over it. */
export const WHEEL_EVENT_NAME = 'wheel';
/** The `deltaMode` of a wheel event that measures its move in lines rather than pixels. */
export const WHEEL_DELTA_MODE_LINE = 1;
/** The `button` value of a pointer event from the middle mouse button (the wheel pressed down). */
export const MIDDLE_POINTER_BUTTON = 1;
/** The `key` values of the bed zoom shortcuts: plus or equals zooms in, minus zooms out, zero fits the bed. */
export const PLUS_KEY = '+';
export const EQUALS_KEY = '=';
export const MINUS_KEY = '-';
export const ZERO_KEY = '0';
/** Fired on window when a key comes up. */
export const KEYUP_EVENT_NAME = 'keyup';
/** Fired on an element when its content scrolls. */
export const SCROLL_EVENT_NAME = 'scroll';
/** The `key` value of the Escape key. */
export const ESCAPE_KEY = 'Escape';
/** The `key` value of the Enter key. */
export const ENTER_KEY = 'Enter';
/** The `key` value of the Space bar. */
export const SPACE_KEY = ' ';
/** The `button` value of a pointer event from the primary button: left mouse, touch or pen contact. */
export const PRIMARY_POINTER_BUTTON = 0;
/** Fired by a media query list when its match changes, for example when the window crosses a breakpoint. */
export const CHANGE_EVENT_NAME = 'change';
/** Fired on window when it loses focus, for example when the user switches to another window. */
export const BLUR_EVENT_NAME = 'blur';
/** Fired on document when the tab is hidden or shown again. */
export const VISIBILITY_CHANGE_EVENT_NAME = 'visibilitychange';
/** The `document.visibilityState` value of a tab the user cannot see. */
export const HIDDEN_VISIBILITY_STATE = 'hidden';
/** The `key` values of the arrow keys. */
export const ARROW_UP_KEY = 'ArrowUp';
export const ARROW_DOWN_KEY = 'ArrowDown';
export const ARROW_LEFT_KEY = 'ArrowLeft';
export const ARROW_RIGHT_KEY = 'ArrowRight';
/** The `key` values of the Home and End keys. */
export const HOME_KEY = 'Home';
export const END_KEY = 'End';
/** The `key` value of the Delete key. */
export const DELETE_KEY = 'Delete';
/** The `key` value of the Backspace key. */
export const BACKSPACE_KEY = 'Backspace';
/** Fired on window when the page is left: closed, reloaded or navigated away from. */
export const PAGE_HIDE_EVENT_NAME = 'pagehide';
/** Matches an element inside a region the user can edit as text; `contenteditable="false"` switches a region off. */
export const CONTENT_EDITABLE_REGION_SELECTOR = '[contenteditable]:not([contenteditable="false"])';
/** The `dataTransfer.types` entry of a drag that carries files, as opposed to text or links. */
export const DATA_TRANSFER_FILES_TYPE = 'Files';
/** The `key` value of the Z key, lowercased: Ctrl or Cmd plus Z undoes, with Shift it redoes. */
export const UNDO_KEY = 'z';
/** The `key` value of the Y key, lowercased: Ctrl or Cmd plus Y redoes. */
export const REDO_KEY = 'y';
/** The `key` value of the S key, lowercased: Ctrl or Cmd plus S saves the project. */
export const SAVE_KEY = 's';
/** The `key` value of the P key, lowercased: P alone switches the laser pointer on and off. */
export const POINTER_TOGGLE_KEY = 'p';
/** Fired on window when its size changes. */
export const RESIZE_EVENT_NAME = 'resize';
/** Fired on an element when the pointer leaves it or one of its children; React builds its mouse leave from it. */
export const MOUSE_OUT_EVENT_NAME = 'mouseout';
/** Matches every element under the pointer, from the root down to the innermost one. */
export const HOVERED_ELEMENT_SELECTOR = ':hover';
