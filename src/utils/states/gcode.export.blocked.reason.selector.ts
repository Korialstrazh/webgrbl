/**
 * Why the G-code export cannot start now, as a text key; undefined when it can. It needs an active machine profile and
 * at least one layer that is on; an empty project is told to add artwork first.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DEFAULT } from '../localization/default.locales';
import { selectActiveMachineProfile } from './machine.profile.state';
import type { AppRootState } from './new.store';
import { selectEnabledProjectLayers, selectProjectObjects } from './project.document.state';

export const selectGcodeExportBlockedReasonKey = (state: AppRootState): string | undefined => {
  if (!selectActiveMachineProfile(state)) {
    return DEFAULT.GCODE_EXPORT_NEEDS_PROFILE;
  }

  if (!selectProjectObjects(state).length) {
    return DEFAULT.GCODE_EXPORT_NEEDS_ARTWORK;
  }

  return selectEnabledProjectLayers(state).length ? undefined : DEFAULT.GCODE_EXPORT_NEEDS_LAYER;
};
