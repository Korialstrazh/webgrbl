/**
 * Where the cells of a burn dose grid lie.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnDoseGrid } from './BurnDoseGrid';

export type BurnGridLayout = Pick<BurnDoseGrid, 'originXMm' | 'originYMm' | 'cellMm' | 'columnCount' | 'rowCount'>;
