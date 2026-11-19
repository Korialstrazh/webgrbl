/**
 * Which way a fill line's overscan points and the work area width that bounds it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { FillLineScan } from './FillLineScan';
import type { FillMovesInput } from './FillMovesInput';

export type FillLineOverscan = Pick<FillLineScan, 'direction'> & Pick<FillMovesInput, 'workAreaXMm'>;
