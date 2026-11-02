/**
 * The laser settings a one-line layer summary shows: mode, maximum power, speed and passes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LayerSettings } from './LayerSettings';

export type LayerSummarySettings = Pick<LayerSettings, 'mode' | 'maxPowerPercent' | 'speedMmPerMin' | 'passes'>;
