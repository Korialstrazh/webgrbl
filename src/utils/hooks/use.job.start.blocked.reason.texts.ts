/**
 * Every reason Start job is off now, as full translated sentences for the lock note's list; empty when it can start.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { selectJobStartBlockedReasonKeys } from '../states/job.start.blocked.reason.selector';

export const useJobStartBlockedReasonTexts = (): string[] => {
  const { t } = useTranslation();
  const reasonKeys: readonly string[] = useSelector(selectJobStartBlockedReasonKeys, shallowEqual);

  return reasonKeys.map((reasonKey: string): string => t(reasonKey));
};
