/**
 * What one layer row needs: its layer, the palette entry it comes from and what to do on each action.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { DragEvent, RefCallback } from 'react';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';

export interface LayerRowProps {
  layer: ProjectLayer;
  /** The key of the layer, set on the row so a touch drag finds it. */
  layerKey: string;
  /** The palette entry the layer comes from; undefined when the colour is not in the current palette. */
  layerEntry: PaletteEntry | undefined;
  /** Whether the layer burns first, so it cannot move up. */
  isFirst: boolean;
  /** Whether the layer burns last, so it cannot move down. */
  isLast: boolean;
  /** Whether the settings drawer shows this layer, so the whole row is highlighted as its owner. */
  isOpen: boolean;
  onOpen: () => void;
  /** Receives the button that opens the settings, so the focus can go back to it when the drawer closes. */
  openButtonRef: RefCallback<HTMLButtonElement>;
  onToggle: (enabled: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: (dragEvent: DragEvent<HTMLLIElement>) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  /** Moves this layer to the place of the layer with the given key, while its handle is dragged by touch or pen. */
  onPointerDragOver: (targetKey: string) => void;
}
