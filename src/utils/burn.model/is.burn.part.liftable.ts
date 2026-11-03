/**
 * Whether the user can lift a part out of the sheet: one that is free or may be.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BURN_PART_STATUS } from './burn.model.constants';
import type { BurnPart } from './interfaces/BurnPart';

export const isBurnPartLiftable = ({ status }: BurnPart): boolean => status !== BURN_PART_STATUS.NOT_THROUGH;
