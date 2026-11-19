/**
 * Props of the preset buttons of the layer settings drawer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { LayerSettingsFieldsProps } from './LayerSettingsFieldsProps';

export type LayerPresetButtonsProps = Pick<LayerSettingsFieldsProps, 'layer'>;
