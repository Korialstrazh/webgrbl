/**
 * Gets the viewport size of an SVG root in its user units: its viewBox size, or without one its width and height in
 * CSS pixels. An SVG with no size at all gives a zero viewport.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgViewportSize } from './interfaces/SvgViewportSize';
import { getSvgPhysicalSize } from '../get.svg.physical.size';
import { getSvgRootViewportBounds } from '../get.svg.root.viewport.bounds';
import { getSvgViewBox } from '../get.svg.view.box';
import type { SvgViewportBounds } from '../interfaces/SvgViewportBounds';

export const getSvgRootViewportSize = (rootElement: Element): SvgViewportSize => {
  const bounds: SvgViewportBounds = getSvgRootViewportBounds(
    getSvgViewBox(rootElement),
    getSvgPhysicalSize(rootElement) ?? { widthMm: 0, heightMm: 0 },
  );

  return { width: bounds.width, height: bounds.height };
};
