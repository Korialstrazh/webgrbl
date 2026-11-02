/**
 * Props of BedViewport: what the bed drawing needs, without the view box and zoom it works out itself, plus whether
 * the window is wide, which decides whether a plain mouse wheel zooms.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedViewProps } from '../../../views/BedView/interfaces/BedViewProps';

type BedViewportDrawingProps = Omit<BedViewProps, 'viewBox' | 'zoom'>;

export interface BedViewportProps extends BedViewportDrawingProps {
  /** In a wide window the bed fills its panel and a plain wheel zooms; stacked, the wheel scrolls the page. */
  isWide: boolean;
  /** The element in the bed header that shows the zoom, Fit and bed colour controls; null until it is mounted. */
  controlsHost: HTMLElement | null;
}
