/**
 * A change to some laser settings of a layer: only the fields given are changed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LayerSettings } from './LayerSettings';

export type LayerSettingsChange = Partial<LayerSettings>;
