/**
 * Builds the action-type function of one state: every type it returns starts with the state's namespace.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';

export const actionTypePrefixer = (namespace: string): ActionTypeFormatter =>
  (actionName: string): string => `[${namespace}] ${actionName}`;
