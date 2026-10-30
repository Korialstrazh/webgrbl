/**
 * Direction of a console view entry: the engine directions plus lines the app itself adds.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_CONSOLE_DIRECTION } from '../grbl/grbl.constants';

export const GRBL_CONSOLE_VIEW_DIRECTION = {
  ...GRBL_CONSOLE_DIRECTION,
  INFO: 'info',
  ERROR: 'error',
} as const;

export type GrblConsoleViewDirection = (typeof GRBL_CONSOLE_VIEW_DIRECTION)[keyof typeof GRBL_CONSOLE_VIEW_DIRECTION];
