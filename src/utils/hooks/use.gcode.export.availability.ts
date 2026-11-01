/**
 * Tells whether the G-code export can start: it needs an active machine profile and at least one layer that is on,
 * and it waits while a toolpath generation runs.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useSelector } from 'react-redux';
import type { GcodeExportAvailability } from './interfaces/GcodeExportAvailability';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT } from '../localization/default.locales';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile } from '../states/machine.profile.state';
import { selectEnabledProjectLayers } from '../states/project.document.state';
import { selectToolpathStatus } from '../states/toolpath.state';
import { TOOLPATH_STATUS } from '../states/toolpath.status.constants';
import type { ToolpathStatus } from '../states/toolpath.status.constants';

const getBlockedReasonKey = (hasActiveProfile: boolean, hasEnabledLayer: boolean): string | undefined => {
  if (!hasActiveProfile) {
    return DEFAULT.GCODE_EXPORT_NEEDS_PROFILE;
  }

  return hasEnabledLayer ? undefined : DEFAULT.GCODE_EXPORT_NEEDS_LAYER;
};

export const useGcodeExportAvailability = (): GcodeExportAvailability => {
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const enabledLayers: ProjectLayer[] = useSelector(selectEnabledProjectLayers);
  const toolpathStatus: ToolpathStatus = useSelector(selectToolpathStatus);
  const gcodeExportBlockedReasonKey: string | undefined = getBlockedReasonKey(
    Boolean(activeProfile),
    Boolean(enabledLayers.length),
  );

  return {
    isGcodeExportEnabled: !gcodeExportBlockedReasonKey && toolpathStatus !== TOOLPATH_STATUS.GENERATING,
    gcodeExportBlockedReasonKey,
  };
};
