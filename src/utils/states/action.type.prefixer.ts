/**
 * Builds the action-type function of one state: every type it returns starts with the state's namespace.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';

export const actionTypePrefixer = (namespace: string): ActionTypeFormatter =>
  (actionName: string): string => `[${namespace}] ${actionName}`;
