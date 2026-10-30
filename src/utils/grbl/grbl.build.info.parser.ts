/**
 * Reads the usable receive buffer size from a GRBL `[OPT:...]` build option line.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_BUILD_OPTION_PATTERN, GRBL_RX_BUFFER_UNUSABLE_BYTES } from './grbl.constants';

export const getGrblRxBufferSizeFromBuildOption = (feedbackText: string): number | undefined => {
  const optionMatch: RegExpMatchArray | null = feedbackText.trim().match(GRBL_BUILD_OPTION_PATTERN);

  return optionMatch ? Number(optionMatch[1]) - GRBL_RX_BUFFER_UNUSABLE_BYTES : undefined;
};
