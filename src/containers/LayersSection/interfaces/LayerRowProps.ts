/**
 * What one layer row needs: its layer, the palette entry it comes from and what to do on each action.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { DragEvent } from 'react';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';

export interface LayerRowProps {
  layer: ProjectLayer;
  /** The palette entry the layer comes from; undefined when the colour is not in the current palette. */
  layerEntry: PaletteEntry | undefined;
  /** Whether the layer burns first, so it cannot move up. */
  isFirst: boolean;
  /** Whether the layer burns last, so it cannot move down. */
  isLast: boolean;
  /** Whether the settings drawer shows this layer, so the whole row is highlighted as its owner. */
  isOpen: boolean;
  onOpen: () => void;
  onToggle: (enabled: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: (dragEvent: DragEvent<HTMLLIElement>) => void;
  onDragEnd: () => void;
  onDrop: () => void;
}
