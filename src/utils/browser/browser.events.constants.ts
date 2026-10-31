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
