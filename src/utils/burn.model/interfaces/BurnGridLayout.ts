/**
 * Where the cells of a burn dose grid lie.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnDoseGrid } from './BurnDoseGrid';

export type BurnGridLayout = Pick<BurnDoseGrid, 'originXMm' | 'originYMm' | 'cellMm' | 'columnCount' | 'rowCount'>;
