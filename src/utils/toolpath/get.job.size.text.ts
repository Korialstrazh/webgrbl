/**
 * Gets the job size line of the playback bar: the width and height of the toolpath box, for example
 * "Job 50.0 x 30.0 mm" with the typographic signs of the locale. The time sits next to it in the playback clock.
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
import type { ToolpathBounds } from './interfaces/ToolpathBounds';

const JOB_SIZE_DECIMALS = 1;

export const getJobSizeText = (t: TFunction, bounds: ToolpathBounds | undefined): string =>
  t(DEFAULT.SIMULATION_JOB_SIZE, {
    width: (bounds ? bounds.maxX - bounds.minX : 0).toFixed(JOB_SIZE_DECIMALS),
    height: (bounds ? bounds.maxY - bounds.minY : 0).toFixed(JOB_SIZE_DECIMALS),
  });
