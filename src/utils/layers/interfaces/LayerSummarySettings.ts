/**
 * The laser settings a one-line layer summary shows: mode, maximum power, speed and passes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { LayerSettings } from './LayerSettings';

export type LayerSummarySettings = Pick<LayerSettings, 'mode' | 'maxPowerPercent' | 'speedMmPerMin' | 'passes'>;
