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
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_SPLITTER_ORIENTATION_VERTICAL } from '../../../utils/antd.constants';
import { getRootFontSizePixels } from '../../../utils/browser/get.root.font.size.pixels';
import type { ElementSizePx } from '../../../utils/hooks/interfaces/ElementSizePx';
import { useElementSizePx } from '../../../utils/hooks/use.element.size.px';
import { getConsoleSizePercent } from '../../../utils/layout/get.console.size.percent';
import { getPanelLimitsPercent } from '../../../utils/layout/get.panel.limits.percent';
import { getPercentText } from '../../../utils/layout/get.percent.text';
import { getSplitterStepPercent } from '../../../utils/layout/get.splitter.step.percent';
import { getValidConsoleSizePercent } from '../../../utils/layout/get.valid.console.size.percent';
import {
  BED_PANEL_MIN_HEIGHT_REM,
  CONSOLE_PANEL_DEFAULT_SIZE_PERCENT,
  CONSOLE_PANEL_MIN_HEIGHT_REM,
  PANEL_SIZE_PERCENT_TOTAL,
} from '../../../utils/layout.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { AppDispatch } from '../../../utils/states/new.store';
import {
  ConsoleSizeResized,
  selectConsoleSizePercent,
  selectIsConsoleOpen,
} from '../../../utils/states/panel.layout.state';
import { SplitterHandles } from '../../../views/SplitterHandles';
import { ConsoleDock } from '../ConsoleDock';
import type { BedColumnSplitterProps } from './interfaces/BedColumnSplitterProps';
import styles from './styles.module.scss';

export const BedColumnSplitter = ({ bedPanelComponent }: BedColumnSplitterProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConsoleOpen: boolean = useSelector(selectIsConsoleOpen);
  const consoleSizePercent: number | undefined = useSelector(selectConsoleSizePercent);
  const [rootFontSizePx] = useState<number>(getRootFontSizePixels);
  // The height while a drag is going on; it is stored only when the drag ends.
  const [draggedConsoleSizePercent, setDraggedConsoleSizePercent] = useState<number | undefined>(undefined);
  const shownConsoleSizePercent: number =
    draggedConsoleSizePercent ?? consoleSizePercent ?? CONSOLE_PANEL_DEFAULT_SIZE_PERCENT;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const columnSize: ElementSizePx = useElementSizePx(wrapperRef);

  const storeKeyboardSizes = ([, nextConsoleSizePercent]: number[]): void => {
    const validConsoleSizePercent: number | undefined = getValidConsoleSizePercent(nextConsoleSizePercent);

    if (validConsoleSizePercent) {
      dispatch(new ConsoleSizeResized({ consoleSizePercent: validConsoleSizePercent }));
    }
  };

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
    <div ref={wrapperRef} className={styles.bedColumnSplitterWrapper}>
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
            size={getPercentText(shownConsoleSizePercent)}
            min={CONSOLE_PANEL_MIN_HEIGHT_REM * rootFontSizePx}
          >
            <ConsoleDock />
          </Splitter.Panel>
        )}
      </Splitter>
      {isConsoleOpen && (
        <SplitterHandles
          sizePercents={[PANEL_SIZE_PERCENT_TOTAL - shownConsoleSizePercent, shownConsoleSizePercent]}
          limits={[
            getPanelLimitsPercent(
              { minPx: BED_PANEL_MIN_HEIGHT_REM * rootFontSizePx, maxPx: undefined },
              columnSize.heightPx,
            ),
            getPanelLimitsPercent(
              { minPx: CONSOLE_PANEL_MIN_HEIGHT_REM * rootFontSizePx, maxPx: undefined },
              columnSize.heightPx,
            ),
          ]}
          isVertical
          stepPercent={getSplitterStepPercent(columnSize.heightPx, rootFontSizePx)}
          barLabels={[t(DEFAULT.LAYOUT_RESIZE_CONSOLE)]}
          onSizesChange={storeKeyboardSizes}
        />
      )}
    </div>
  );
};
