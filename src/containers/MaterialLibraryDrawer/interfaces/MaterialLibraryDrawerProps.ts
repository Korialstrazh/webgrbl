/**
 * Props of the material library drawer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
