/**
 * Makes the bed area a drop target for SVG files. A drag over it shows a highlight, and a drop asks for an import of
 * every dropped file; the import names each file that is not a usable SVG in an error toast. A drop with no file asks
 * for nothing, and a drag of anything but files is not accepted. While imports are off (the 3D view has no bed to drop
 * on) a dragged file is refused with no highlight, but the browser still must not open it in place of the app.
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
import type { AppDispatch } from '../../utils/states/new.store';
import { SvgFilesImportRequested } from '../../utils/states/project.document.state';
import type { SvgFileDropArea } from './interfaces/SvgFileDropArea';

const DROP_EFFECT_NONE = 'none';

const isFileDrag = (dragEvent: DragEvent<HTMLElement>): boolean =>
  dragEvent.dataTransfer.types.includes(DATA_TRANSFER_FILES_TYPE);

const isDragStillInsideArea = (dragEvent: DragEvent<HTMLElement>): boolean =>
  dragEvent.relatedTarget instanceof Node && dragEvent.currentTarget.contains(dragEvent.relatedTarget);

export const useSvgFileDrop = (isImportEnabled: boolean): SvgFileDropArea => {
  const dispatch: AppDispatch = useDispatch();
  const [isDropTarget, setIsDropTarget] = useState<boolean>(false);

  // Only a drag of files is accepted, so dragged text or links show no highlight and cannot be dropped.
  const handleDragOver = (dragEvent: DragEvent<HTMLElement>): void => {
    if (!isFileDrag(dragEvent)) {
      return;
    }

    dragEvent.preventDefault();

    if (isImportEnabled) {
      setIsDropTarget(true);
    } else {
      dragEvent.dataTransfer.dropEffect = DROP_EFFECT_NONE;
    }
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

    // Every file goes to the import, which names each one that is not a usable SVG in an error toast.
    const droppedFiles: File[] = Array.from(dragEvent.dataTransfer.files);

    if (isImportEnabled && droppedFiles.length) {
      dispatch(new SvgFilesImportRequested({ files: droppedFiles }));
    }
  };

  return { isDropTarget: isImportEnabled && isDropTarget, handleDragOver, handleDragLeave, handleDrop };
};
