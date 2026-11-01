/**
 * The bed area as a drop target for SVG files: whether files are dragged over it now, and its drag and drop handlers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { DragEvent } from 'react';

export interface SvgFileDropArea {
  /** Whether a drag is over the area, so it shows the drop highlight. */
  isDropTarget: boolean;
  /** Accepts a drag of files, which a browser needs before it allows a drop, and shows the highlight. */
  handleDragOver: (dragEvent: DragEvent<HTMLElement>) => void;
  /** Hides the highlight once the drag leaves the area, not when it only moves onto a child of it. */
  handleDragLeave: (dragEvent: DragEvent<HTMLElement>) => void;
  /** Imports the dropped SVG files and ignores every other file. */
  handleDrop: (dragEvent: DragEvent<HTMLElement>) => void;
}
