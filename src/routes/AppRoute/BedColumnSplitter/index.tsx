/**
 * The middle column of the wide workbench: the bed, and below it the console while it is open, in a vertical antd
 * Splitter, so the user can drag the bar between them. Both keep a minimum height in rem, so the bed drawing and the
 * playback bar never disappear behind the console. The console opens with the stored height, or the default, and the
 * new height is stored once a drag ends.
 *
 * The console height is passed as a controlled size: antd reads default sizes only when the splitter mounts, so a
 * console panel added later would ignore its default height, and remounting the splitter would remount the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Splitter } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_SPLITTER_ORIENTATION_VERTICAL } from '../../../utils/antd.constants';
import { getRootFontSizePixels } from '../../../utils/browser/get.root.font.size.pixels';
import { getConsoleSizePercent } from '../../../utils/layout/get.console.size.percent';
import { getPercentText } from '../../../utils/layout/get.percent.text';
import {
  BED_PANEL_MIN_HEIGHT_REM,
  CONSOLE_PANEL_DEFAULT_SIZE_PERCENT,
  CONSOLE_PANEL_MIN_HEIGHT_REM,
} from '../../../utils/layout.constants';
import type { AppDispatch } from '../../../utils/states/new.store';
import {
  ConsoleSizeResized,
  selectConsoleSizePercent,
  selectIsConsoleOpen,
} from '../../../utils/states/panel.layout.state';
import { ConsoleDock } from '../ConsoleDock';
import type { BedColumnSplitterProps } from './interfaces/BedColumnSplitterProps';
import styles from './styles.module.scss';

export const BedColumnSplitter = ({ bedPanelComponent }: BedColumnSplitterProps): ReactNode => {
  const dispatch: AppDispatch = useDispatch();
  const isConsoleOpen: boolean = useSelector(selectIsConsoleOpen);
  const consoleSizePercent: number | undefined = useSelector(selectConsoleSizePercent);
  const [rootFontSizePx] = useState<number>(getRootFontSizePixels);
  // The height while a drag is going on; it is stored only when the drag ends.
  const [draggedConsoleSizePercent, setDraggedConsoleSizePercent] = useState<number | undefined>(undefined);
  const consoleSizeText: string = getPercentText(
    draggedConsoleSizePercent ?? consoleSizePercent ?? CONSOLE_PANEL_DEFAULT_SIZE_PERCENT,
  );

  const handleColumnResize = (columnPanelSizesPx: number[]): void => {
    const resizedConsoleSizePercent: number | undefined = getConsoleSizePercent(columnPanelSizesPx);

    if (resizedConsoleSizePercent) {
      setDraggedConsoleSizePercent(resizedConsoleSizePercent);
    }
  };

  const handleColumnResizeEnd = (columnPanelSizesPx: number[]): void => {
    const resizedConsoleSizePercent: number | undefined = getConsoleSizePercent(columnPanelSizesPx);

    setDraggedConsoleSizePercent(undefined);

    if (resizedConsoleSizePercent) {
      dispatch(new ConsoleSizeResized({ consoleSizePercent: resizedConsoleSizePercent }));
    }
  };

  return (
    <Splitter
      className={styles.bedColumnSplitter}
      orientation={ANTD_SPLITTER_ORIENTATION_VERTICAL}
      onResize={handleColumnResize}
      onResizeEnd={handleColumnResizeEnd}
    >
      <Splitter.Panel className={styles.splitterPanel} min={BED_PANEL_MIN_HEIGHT_REM * rootFontSizePx}>
        {bedPanelComponent}
      </Splitter.Panel>
      {isConsoleOpen && (
        <Splitter.Panel
          className={styles.splitterPanel}
          size={consoleSizeText}
          min={CONSOLE_PANEL_MIN_HEIGHT_REM * rootFontSizePx}
        >
          <ConsoleDock />
        </Splitter.Panel>
      )}
    </Splitter>
  );
};
