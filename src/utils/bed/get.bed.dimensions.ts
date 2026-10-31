/**
 * Reads the bed size from the GRBL travel settings ($130 and $131), falling back to a default size.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  BED_MAX_TRAVEL_MM,
  BED_PLACEHOLDER_KIND,
  DEFAULT_BED_SIZE_MM,
  GRBL_SETTING_X_MAX_TRAVEL,
  GRBL_SETTING_Y_MAX_TRAVEL,
} from './bed.constants';
import type { BedDimensions } from './interfaces/BedDimensions';

const isValidBedTravel = (travelMm: number): boolean =>
  Number.isFinite(travelMm) && travelMm > 0 && travelMm <= BED_MAX_TRAVEL_MM;

export const getBedDimensions = (settings: Record<number, string>, isConnected: boolean): BedDimensions => {
  if (!isConnected) {
    return {
      widthMm: DEFAULT_BED_SIZE_MM,
      heightMm: DEFAULT_BED_SIZE_MM,
      placeholderKind: BED_PLACEHOLDER_KIND.NO_MACHINE,
    };
  }

  const widthMm: number = Number(settings[GRBL_SETTING_X_MAX_TRAVEL]);
  const heightMm: number = Number(settings[GRBL_SETTING_Y_MAX_TRAVEL]);

  if (!isValidBedTravel(widthMm) || !isValidBedTravel(heightMm)) {
    return {
      widthMm: DEFAULT_BED_SIZE_MM,
      heightMm: DEFAULT_BED_SIZE_MM,
      placeholderKind: BED_PLACEHOLDER_KIND.SIZE_UNKNOWN,
    };
  }

  return { widthMm, heightMm, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
};
