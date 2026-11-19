/**
 * Props of the list of the material library: one compact row per preset.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Key, ReactNode } from 'react';
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';
import type { MaterialPresetRow } from '../../../utils/materials/interfaces/MaterialPresetRow';
import type { MaterialPresetOperation } from '../../../utils/materials/material.preset.constants';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';

/** The active laser: its presets also show their power as percent of it, the unit the layers use. */
export type MaterialPresetPowerReference = Pick<MachineProfile, 'id' | 'maxPowerWatts'>;

/** The row buttons that apply a preset to the layer the library was opened from. */
export interface MaterialPresetRowApply {
  /** The name of that layer, for the button labels. */
  layerName: string;
  /** The active machine: only its presets get a button, as the watts of another laser mean nothing on it. */
  machineProfileId: string;
  /** Rated power of the active laser, in watts; a preset above it cannot be applied. */
  maxPowerWatts: number;
  /** The preset applied a moment ago, whose row says so in place of its button. */
  appliedPresetId: string | undefined;
  onApply: (preset: MaterialPreset) => void;
}

export interface MaterialPresetTableProps {
  rows: MaterialPresetRow[];
  /** The presets ticked for export. */
  tickedPresetIds: Key[];
  /** Whether each row names its machine, which it does when the rows can belong to several lasers. */
  isMachineNamed: boolean;
  /** The active laser; undefined without one, and then no row shows a percent. */
  activeProfile: MaterialPresetPowerReference | undefined;
  /** The row buttons when the library was opened from a layer; none otherwise. */
  rowApply?: MaterialPresetRowApply;
  /** What the table shows without rows. */
  emptyStateComponent: ReactNode;
  getOperationLabel: (operation: MaterialPresetOperation) => string;
  getProfileName: (profileId: string) => string;
  onTick: (presetIds: Key[]) => void;
  onPick: (preset: MaterialPreset) => void;
}
