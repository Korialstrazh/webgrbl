/**
 * Whether the user can lift a part out of the sheet: one that is free or may be.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BURN_PART_STATUS } from './burn.model.constants';
import type { BurnPart } from './interfaces/BurnPart';

export const isBurnPartLiftable = ({ status }: BurnPart): boolean => status !== BURN_PART_STATUS.NOT_THROUGH;
