/**
 * Direction of a console view entry: the engine directions plus lines the app itself adds.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { GRBL_CONSOLE_DIRECTION } from '../grbl/grbl.constants';

export const GRBL_CONSOLE_VIEW_DIRECTION = {
  ...GRBL_CONSOLE_DIRECTION,
  INFO: 'info',
  ERROR: 'error',
} as const;

export type GrblConsoleViewDirection = (typeof GRBL_CONSOLE_VIEW_DIRECTION)[keyof typeof GRBL_CONSOLE_VIEW_DIRECTION];
