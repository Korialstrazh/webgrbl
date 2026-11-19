/**
 * The translation key of the text shown on the bed for each placeholder kind; no text when the size is real.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import type { BedPlaceholderKind } from '../../utils/bed/bed.constants';
import { DEFAULT } from '../../utils/localization/default.locales';

export const BED_PLACEHOLDER_LABEL_KEYS: Record<BedPlaceholderKind, string | undefined> = {
  [BED_PLACEHOLDER_KIND.NONE]: undefined,
  [BED_PLACEHOLDER_KIND.NO_MACHINE]: DEFAULT.BED_NO_MACHINE,
  [BED_PLACEHOLDER_KIND.SIZE_UNKNOWN]: DEFAULT.BED_SIZE_UNKNOWN,
};
