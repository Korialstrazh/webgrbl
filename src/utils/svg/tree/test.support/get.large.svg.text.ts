/**
 * Builds a large test SVG: layers of groups of paths, for checks that the element tree stays fast with many rows.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SVG_TREE_LAYER_ATTRIBUTE_NAME } from '../svg.tree.constants';

/** The shape of the large test SVG. */
export interface LargeSvgShape {
  /** Top-level layers. */
  layerCount: number;
  /** Groups inside each layer. */
  groupCount: number;
  /** Paths inside each group. */
  pathCount: number;
}

const getRepeatedText = (count: number, getItemText: (index: number) => string): string =>
  Array.from({ length: count }, (_unused: unknown, index: number): string => getItemText(index)).join('');

export const getLargeSvgText = ({ layerCount, groupCount, pathCount }: LargeSvgShape): string => {
  const layersText: string = getRepeatedText(layerCount, (layerIndex: number): string =>
    `<g ${SVG_TREE_LAYER_ATTRIBUTE_NAME}="true" id="layer-${layerIndex}">`
    + getRepeatedText(groupCount, (groupIndex: number): string =>
      `<g id="group-${layerIndex}-${groupIndex}">`
      + getRepeatedText(pathCount, (pathIndex: number): string =>
        `<path id="path-${layerIndex}-${groupIndex}-${pathIndex}" d="M0 0L${pathIndex + 1} 1" stroke="#ff0000"/>`)
      + '</g>')
    + '</g>');

  return '<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="0 0 100 100">'
    + `${layersText}</svg>`;
};
