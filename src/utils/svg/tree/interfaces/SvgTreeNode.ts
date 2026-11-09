/**
 * One element of an object's SVG as the Objects card shows it in the element tree.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgTreeNodeKind } from '../svg.tree.constants';

export interface SvgTreeNode {
  /** Child indexes from the root element, joined with a dot; stable while the SVG text does not change. */
  path: string;
  /** Readable name: the Inkscape label, else the id, else the element name. */
  name: string;
  /** Whether it is an Inkscape layer, another group, or a shape. */
  kind: SvgTreeNodeKind;
  /** The SVG element name (rect, circle, path, ...), so a shape can show an icon of its own type. */
  elementName: string;
  /** True when the element itself is turned off. */
  isDisabled: boolean;
  /** True when an ancestor is turned off, so the element is left out too. */
  isInsideDisabled: boolean;
  /** Child nodes, empty for a shape. */
  children: SvgTreeNode[];
}
