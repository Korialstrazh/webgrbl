/**
 * Turns an action name into the namespaced action type of one state.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export type ActionTypeFormatter = (actionName: string) => string;
