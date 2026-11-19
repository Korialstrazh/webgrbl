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
import { selectGcodeExportBlockedReasonKey } from '../states/gcode.export.blocked.reason.selector';
import { selectToolpathStatus } from '../states/toolpath.state';
import { TOOLPATH_STATUS } from '../states/toolpath.status.constants';
import type { ToolpathStatus } from '../states/toolpath.status.constants';
import type { GcodeExportAvailability } from './interfaces/GcodeExportAvailability';

export const useGcodeExportAvailability = (): GcodeExportAvailability => {
  const gcodeExportBlockedReasonKey: string | undefined = useSelector(selectGcodeExportBlockedReasonKey);
  const toolpathStatus: ToolpathStatus = useSelector(selectToolpathStatus);

  return {
    isGcodeExportEnabled: !gcodeExportBlockedReasonKey && toolpathStatus !== TOOLPATH_STATUS.GENERATING,
    gcodeExportBlockedReasonKey,
  };
};
