/**
 * Gets the layer line of the Job card: how many layers are sent to the laser and, when some are, how many are off,
 * the two parts joined by a middle dot.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
