/**
 * Props of the preset buttons of the layer settings drawer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LayerSettingsFieldsProps } from './LayerSettingsFieldsProps';

export type LayerPresetButtonsProps = Pick<LayerSettingsFieldsProps, 'layer'>;
