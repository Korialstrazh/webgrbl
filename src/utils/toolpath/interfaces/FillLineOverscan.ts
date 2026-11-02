/**
 * Which way a fill line's overscan points and the work area width that bounds it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { FillLineScan } from './FillLineScan';
import type { FillMovesInput } from './FillMovesInput';

export type FillLineOverscan = Pick<FillLineScan, 'direction'> & Pick<FillMovesInput, 'workAreaXMm'>;
