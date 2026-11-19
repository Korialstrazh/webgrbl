/**
 * Gets why the frame settings are off: a profile holds them, and a run keeps them fixed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DEFAULT } from '../../../../utils/localization/default.locales';

/** Why the settings are off: a profile holds them, and a run keeps them fixed. */
export const getFrameSettingsOffReasonKey = (
  hasActiveProfile: boolean,
  isJobRunActive: boolean,
): string | undefined => {
  if (!hasActiveProfile) {
    return DEFAULT.FRAME_SETTINGS_NEEDS_PROFILE;
  }

  return isJobRunActive ? DEFAULT.FRAME_SETTINGS_RUN_LOCKED : undefined;
};
