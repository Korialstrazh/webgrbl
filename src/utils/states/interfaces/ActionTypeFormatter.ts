/**
 * Turns an action name into the namespaced action type of one state.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export type ActionTypeFormatter = (actionName: string) => string;
