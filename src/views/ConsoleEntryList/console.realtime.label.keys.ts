/**
 * Localisation key of the label each realtime command shows in the console.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_REALTIME_COMMAND } from '../../utils/grbl/grbl.constants';
import type { GrblRealtimeCommand } from '../../utils/grbl/grbl.constants';
import { DEFAULT } from '../../utils/localization/default.locales';

export const CONSOLE_REALTIME_LABEL_KEYS: Readonly<Record<GrblRealtimeCommand, string>> = {
  [GRBL_REALTIME_COMMAND.STATUS_QUERY]: DEFAULT.CONSOLE_REALTIME_STATUS_QUERY,
  [GRBL_REALTIME_COMMAND.FEED_HOLD]: DEFAULT.CONSOLE_REALTIME_FEED_HOLD,
  [GRBL_REALTIME_COMMAND.CYCLE_RESUME]: DEFAULT.CONSOLE_REALTIME_CYCLE_RESUME,
  [GRBL_REALTIME_COMMAND.SOFT_RESET]: DEFAULT.CONSOLE_REALTIME_SOFT_RESET,
  [GRBL_REALTIME_COMMAND.JOG_CANCEL]: DEFAULT.CONSOLE_REALTIME_JOG_CANCEL,
};
