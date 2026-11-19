/**
 * Every reason Start job is off now, as full translated sentences for the lock note's list; empty when it can start.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { selectJobStartBlockedReasonKeys } from '../states/job.start.blocked.reason.selector';

export const useJobStartBlockedReasonTexts = (): string[] => {
  const { t } = useTranslation();
  const reasonKeys: readonly string[] = useSelector(selectJobStartBlockedReasonKeys, shallowEqual);

  return reasonKeys.map((reasonKey: string): string => t(reasonKey));
};
