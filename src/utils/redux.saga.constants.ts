/**
 * The redux-saga take pattern that matches every action. A watcher uses it when its state can change after any
 * reducer pass, so it checks after each one instead of listing the actions.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const EVERY_ACTION_PATTERN = '*';
