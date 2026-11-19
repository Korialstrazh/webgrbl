/**
 * Props of the content of the material library: what the drawer was opened for, and the export ticks the drawer
 * header exports, which the table sets.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Key } from 'react';
import type { MaterialLibraryDrawerProps } from './MaterialLibraryDrawerProps';

export interface MaterialLibraryEditorProps extends Omit<MaterialLibraryDrawerProps, 'isOpen'> {
  /** The presets ticked for export. */
  tickedPresetIds: Key[];
  onTick: (presetIds: Key[]) => void;
}
