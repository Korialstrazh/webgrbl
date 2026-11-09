/**
 * Props of the icon buttons of one element tree node.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgTreeNode } from '../../../../utils/svg/tree/interfaces/SvgTreeNode';

export interface ElementNodeActionsProps {
  /** The node the buttons act on. */
  node: SvgTreeNode;
  /** Turns the node off (skipped by the job) or back on. */
  onDisabledChange: (nodePath: string, isDisabled: boolean) => void;
  /** Removes the node from the object's SVG. */
  onDelete: (nodePath: string) => void;
  /** Gives the node's paint a palette colour. */
  onRecolour: (nodePath: string, colour: string) => void;
}
