/**
 * The wide workbench: the design panel, the bed and the machine panel side by side in an antd Splitter, so the user can
 * drag the bars between them. Each panel keeps a minimum width, and the side panels a maximum width so the bed takes
 * the extra width of a wide screen, in rem so they follow the user's font size. The panels
 * open with the stored sizes, or the default widths, and the new sizes are stored once a drag ends, not on every move.
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
import { getRootFontSizePixels } from '../../../utils/browser/get.root.font.size.pixels';
import { getPanelSizePercents } from '../../../utils/layout/get.panel.size.percents';
import {
  BED_PANEL_MIN_WIDTH_REM,
  DESIGN_PANEL_MAX_WIDTH_REM,
  DESIGN_PANEL_MIN_WIDTH_REM,
  MACHINE_PANEL_MAX_WIDTH_REM,
  MACHINE_PANEL_MIN_WIDTH_REM,
} from '../../../utils/layout.constants';
import type { AppDispatch } from '../../../utils/states/new.store';
import { PanelSizesResized, selectPanelSizePercents } from '../../../utils/states/panel.layout.state';
import { getPanelDefaultSizes } from './get.panel.default.sizes';
import type { PanelDefaultSize } from './interfaces/PanelDefaultSize';
import type { PanelSplitterProps } from './interfaces/PanelSplitterProps';
import styles from './styles.module.scss';

export const PanelSplitter = (props: PanelSplitterProps): ReactNode => {
  const { designPanelComponent, bedPanelComponent, machinePanelComponent } = props;
  const dispatch: AppDispatch = useDispatch();
  const storedPanelSizePercents: number[] | undefined = useSelector(selectPanelSizePercents);
  const [rootFontSizePx] = useState<number>(getRootFontSizePixels);
  // The splitter reads its default sizes only when it mounts, so later stored sizes must not change them.
  const [panelDefaultSizes] = useState<PanelDefaultSize[]>(
    () => getPanelDefaultSizes(storedPanelSizePercents, rootFontSizePx),
  );
  const [designDefaultSize, bedDefaultSize, machineDefaultSize] = panelDefaultSizes;

  const handlePanelResizeEnd = (panelSizesPx: number[]): void => {
    const panelSizePercents: number[] | undefined = getPanelSizePercents(panelSizesPx);

    if (panelSizePercents) {
      dispatch(new PanelSizesResized({ panelSizePercents }));
    }
  };

  return (
    <Splitter className={styles.panelSplitter} onResizeEnd={handlePanelResizeEnd}>
      <Splitter.Panel
        className={styles.splitterPanel}
        defaultSize={designDefaultSize}
        min={DESIGN_PANEL_MIN_WIDTH_REM * rootFontSizePx}
        max={DESIGN_PANEL_MAX_WIDTH_REM * rootFontSizePx}
      >
        {designPanelComponent}
      </Splitter.Panel>
      <Splitter.Panel
        className={styles.splitterPanel}
        defaultSize={bedDefaultSize}
        min={BED_PANEL_MIN_WIDTH_REM * rootFontSizePx}
      >
        {bedPanelComponent}
      </Splitter.Panel>
      <Splitter.Panel
        className={styles.splitterPanel}
        defaultSize={machineDefaultSize}
        min={MACHINE_PANEL_MIN_WIDTH_REM * rootFontSizePx}
        max={MACHINE_PANEL_MAX_WIDTH_REM * rootFontSizePx}
      >
        {machinePanelComponent}
      </Splitter.Panel>
    </Splitter>
  );
};
