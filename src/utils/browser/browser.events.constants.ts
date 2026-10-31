/**
 * Names of the browser events the app listens to on window.
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
