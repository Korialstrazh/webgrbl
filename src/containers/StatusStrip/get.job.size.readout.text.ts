/**
 * Gets the job size readout of the status strip: the width and height of the ready toolpath's box, for example
 * "196.0 x 196.6 mm" with the typographic signs of the locale, or a dash while there is no ready toolpath.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import { DEFAULT } from '../../utils/localization/default.locales';
import { MISSING_VALUE_TEXT } from '../../utils/missing.value.constants';
import type { ToolpathBounds } from '../../utils/toolpath/interfaces/ToolpathBounds';
import { STATUS_STRIP_MM_DECIMALS } from './status.strip.constants';

export const getJobSizeReadoutText = (t: TFunction, bounds: ToolpathBounds | undefined): string =>
  bounds
    ? t(DEFAULT.STATUS_STRIP_JOB_SIZE_VALUE, {
      width: (bounds.maxX - bounds.minX).toFixed(STATUS_STRIP_MM_DECIMALS),
      height: (bounds.maxY - bounds.minY).toFixed(STATUS_STRIP_MM_DECIMALS),
    })
    : MISSING_VALUE_TEXT;
