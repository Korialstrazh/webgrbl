/**
 * Gets the reasons written under the Start and Frame buttons while they are off: one shared line when both wait for a
 * connection, otherwise the reason of each button, without repeats.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../../../utils/localization/default.locales';
import { isString } from '../../../utils/type.guards/is.string';

/** The frame selector reuses the job reason for a missing connection; the frame line names the frame instead. */
const getFrameBlockedReasonKey = (frameBlockedReasonKey: string | undefined): string | undefined => (
  frameBlockedReasonKey === DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED
    ? DEFAULT.FRAME_START_BLOCKED_NOT_CONNECTED
    : frameBlockedReasonKey
);

const getIsBothWaitingForConnection = (startKey: string | undefined, frameKey: string | undefined): boolean => (
  startKey === DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED && frameKey === DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED
);

export const getJobActionBlockedReasonKeys = (
  startBlockedReasonKey: string | undefined,
  frameBlockedReasonKey: string | undefined,
): string[] => {
  if (getIsBothWaitingForConnection(startBlockedReasonKey, frameBlockedReasonKey)) {
    return [DEFAULT.JOB_ACTIONS_BLOCKED_NOT_CONNECTED];
  }

  const reasonKeys: (string | undefined)[] = [startBlockedReasonKey, getFrameBlockedReasonKey(frameBlockedReasonKey)];

  return [...new Set(reasonKeys.filter(isString))];
};
