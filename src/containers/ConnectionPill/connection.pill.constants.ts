/**
 * Label keys of the connection states the pill can show.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import type { GrblConnectionStatus } from '../../utils/grbl/grbl.constants';
import { DEFAULT } from '../../utils/localization/default.locales';

export const CONNECTION_PILL_STATUS_LABEL_KEY: Record<GrblConnectionStatus, string> = {
  [GRBL_CONNECTION_STATUS.DISCONNECTED]: DEFAULT.CONNECTION_PILL_DISCONNECTED,
  [GRBL_CONNECTION_STATUS.CONNECTING]: DEFAULT.CONNECTION_PILL_CONNECTING,
  [GRBL_CONNECTION_STATUS.CONNECTED]: DEFAULT.CONNECTION_PILL_CONNECTED,
  [GRBL_CONNECTION_STATUS.LOST]: DEFAULT.CONNECTION_PILL_LOST,
};
