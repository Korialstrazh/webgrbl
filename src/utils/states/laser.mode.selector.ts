/**
 * Whether laser mode ($32) is known to be on, as read at connect and not changed from the console since.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { GRBL_SETTING_LASER_MODE, GRBL_SETTING_ON_VALUE } from '../grbl/grbl.constants';
import { selectGrblSettings } from './grbl.connection.state';
import { selectIsLaserModeUnconfirmed } from './job.run.state';
import type { AppRootState } from './new.store';

export const selectIsLaserModeConfirmedOn = (state: AppRootState): boolean =>
  !selectIsLaserModeUnconfirmed(state) && selectGrblSettings(state)[GRBL_SETTING_LASER_MODE] === GRBL_SETTING_ON_VALUE;
