/**
 * Props of the content of the material library: what the drawer was opened for, and the export ticks the drawer
 * header exports, which the table sets.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Key } from 'react';
import type { MaterialLibraryDrawerProps } from './MaterialLibraryDrawerProps';

export interface MaterialLibraryEditorProps extends Omit<MaterialLibraryDrawerProps, 'isOpen'> {
  /** The presets ticked for export. */
  tickedPresetIds: Key[];
  onTick: (presetIds: Key[]) => void;
}
