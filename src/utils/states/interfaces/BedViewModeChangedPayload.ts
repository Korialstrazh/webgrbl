/**
 * Payload of a change of what the bed shows.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedViewMode } from '../../bed/bed.view.constants';

export interface BedViewModeChangedPayload {
  /** What the bed shows from now on. */
  viewMode: BedViewMode;
}
