/**
 * Makes the bed area a drop target for SVG files. A drag over it shows a highlight, and a drop asks for an import of
 * the dropped files whose name ends in .svg or whose type is SVG. A drop with no SVG file asks for nothing, and a drag
 * of anything but files is not accepted.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useState } from 'react';
import type { DragEvent } from 'react';
import { useDispatch } from 'react-redux';
import { DATA_TRANSFER_FILES_TYPE } from '../../utils/browser/browser.events.constants';
import { isSvgFile } from '../../utils/svg/is.svg.file';
import type { AppDispatch } from '../../utils/states/new.store';
import { SvgFilesImportRequested } from '../../utils/states/project.document.state';
import type { SvgFileDropArea } from './interfaces/SvgFileDropArea';

const isFileDrag = (dragEvent: DragEvent<HTMLElement>): boolean =>
  dragEvent.dataTransfer.types.includes(DATA_TRANSFER_FILES_TYPE);

const isDragStillInsideArea = (dragEvent: DragEvent<HTMLElement>): boolean =>
  dragEvent.relatedTarget instanceof Node && dragEvent.currentTarget.contains(dragEvent.relatedTarget);

export const useSvgFileDrop = (): SvgFileDropArea => {
  const dispatch: AppDispatch = useDispatch();
  const [isDropTarget, setIsDropTarget] = useState<boolean>(false);

  // Only a drag of files is accepted, so dragged text or links show no highlight and cannot be dropped.
  const handleDragOver = (dragEvent: DragEvent<HTMLElement>): void => {
    if (!isFileDrag(dragEvent)) {
      return;
    }

    dragEvent.preventDefault();
    setIsDropTarget(true);
  };

  const handleDragLeave = (dragEvent: DragEvent<HTMLElement>): void => {
    if (!isDragStillInsideArea(dragEvent)) {
      setIsDropTarget(false);
    }
  };

  const handleDrop = (dragEvent: DragEvent<HTMLElement>): void => {
    // Without this the browser opens the dropped file in place of the app.
    dragEvent.preventDefault();
    setIsDropTarget(false);

    const svgFiles: File[] = Array.from(dragEvent.dataTransfer.files).filter(isSvgFile);

    if (svgFiles.length) {
      dispatch(new SvgFilesImportRequested({ files: svgFiles }));
    }
  };

  return { isDropTarget, handleDragOver, handleDragLeave, handleDrop };
};
