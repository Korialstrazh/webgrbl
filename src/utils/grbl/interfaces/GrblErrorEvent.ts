/**
 * Controller event: the controller answered a line with error:N.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GRBL_CONTROLLER_EVENT_KIND, GrblLineOrigin } from '../grbl.constants';

export interface GrblErrorEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR;
  /** GRBL error code. */
  code: number;
  /** The line the error answers; empty when nothing was in flight. */
  lineText: string;
  /** Where the failed line came from. */
  origin: GrblLineOrigin;
}
