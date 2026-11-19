/**
 * The redux-saga take pattern that matches every action. A watcher uses it when its state can change after any
 * reducer pass, so it checks after each one instead of listing the actions.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const EVERY_ACTION_PATTERN = '*';
