/**
 * Gets the job size and estimate line of the bed toolbar: the width and height of the toolpath box and the estimated
 * time, for example "Job 50.0 x 30.0 mm - est. 1 min 6 s" with the typographic signs of the locale.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import { DEFAULT } from '../localization/default.locales';
import { getJobEstimateText } from './get.job.estimate.text';
import type { ToolpathBounds } from './interfaces/ToolpathBounds';

const JOB_SIZE_DECIMALS = 1;

export const getJobSummaryText = (t: TFunction, bounds: ToolpathBounds | undefined, totalTimeS: number): string =>
  t(DEFAULT.TOOLPATH_JOB_SUMMARY, {
    width: (bounds ? bounds.maxX - bounds.minX : 0).toFixed(JOB_SIZE_DECIMALS),
    height: (bounds ? bounds.maxY - bounds.minY : 0).toFixed(JOB_SIZE_DECIMALS),
    estimate: getJobEstimateText(t, totalTimeS),
  });
