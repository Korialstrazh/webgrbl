/**
 * Tells whether the G-code export can start: it needs an active machine profile and at least one layer that is on,
 * and it waits while a toolpath generation runs.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
