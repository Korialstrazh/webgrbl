/**
 * Props of the material library drawer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface MaterialLibraryDrawerProps {
  /** Whether the drawer is shown. */
  isOpen: boolean;
  /** Called on Escape, the close button and a click on the bed beside the drawer. */
  onClose: () => void;
  /** The layer to apply presets to at the start, when the library is opened from a layer. */
  initialLayerKey?: string;
  /** The material the list is filtered to at the start, when the library is opened from the preset summary. */
  initialMaterialId?: string;
}
