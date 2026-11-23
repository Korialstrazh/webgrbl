/**
 * Props of the icon buttons of one element tree node.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Palette } from '../../../../utils/palette/interfaces/Palette';
import type { SvgTreeNode } from '../../../../utils/svg/tree/interfaces/SvgTreeNode';

export interface ElementNodeActionsProps {
  /** The node the buttons act on. */
  node: SvgTreeNode;
  /** The laser palette the recolour list offers, read once by the tree instead of once per row. */
  palette: Palette;
  /** Turns the node off (skipped by the job) or back on. */
  onDisabledChange: (nodePath: string, isDisabled: boolean) => void;
  /** Removes the node from the object's SVG. */
  onDelete: (nodePath: string) => void;
  /** Gives the node's paint a palette colour. */
  onRecolour: (nodePath: string, colour: string) => void;
}
