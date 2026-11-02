/**
 * Gets the layer line of the Job card: how many layers are sent to the laser and, when some are, how many are off,
 * the two parts joined by a middle dot.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import { MIDDLE_DOT } from '../../../utils/characters.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';

const PART_SEPARATOR = ` ${MIDDLE_DOT} `;

export const getJobLayerCountText = (t: TFunction, enabledLayerCount: number, offLayerCount: number): string => {
  const enabledText: string = t(DEFAULT.MACHINE_JOB_LAYER_COUNT, { count: enabledLayerCount });

  return offLayerCount
    ? [enabledText, t(DEFAULT.MACHINE_JOB_LAYERS_OFF, { count: offLayerCount })].join(PART_SEPARATOR)
    : enabledText;
};
