/**
 * A change to some laser settings of a layer: only the fields given are changed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { LayerSettings } from './LayerSettings';

export type LayerSettingsChange = Partial<LayerSettings>;
