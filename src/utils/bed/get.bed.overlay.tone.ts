/**
 * Gets which set of mark colours a bed colour needs: the dark marks on a bed brighter than the threshold, the light
 * marks on a darker one. A value that is not a colour gets the tone of the default bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getColourRelativeLuminance } from '../theme/get.colour.relative.luminance';
import { BED_OVERLAY_TONE, BED_OVERLAY_TONE_LUMINANCE_THRESHOLD, DEFAULT_BED_COLOUR } from './bed.colour.constants';
import type { BedOverlayTone } from './bed.colour.constants';

export const getBedOverlayTone = (bedColour: string): BedOverlayTone => {
  const luminance: number | undefined =
    getColourRelativeLuminance(bedColour) ?? getColourRelativeLuminance(DEFAULT_BED_COLOUR);

  if ((luminance ?? 1) >= BED_OVERLAY_TONE_LUMINANCE_THRESHOLD) {
    return BED_OVERLAY_TONE.ON_LIGHT;
  }

  return BED_OVERLAY_TONE.ON_DARK;
};
