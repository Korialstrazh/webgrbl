/**
 * The wide workbench: the design panel, the bed and the machine panel side by side in an antd Splitter, so the user can
 * drag the bars between them. Each panel keeps a minimum width, and the side panels a maximum width so the bed takes
 * the extra width of a wide screen, in rem so they follow the user's font size. The panels open with the stored sizes,
 * kept within those limits on this screen, or the default widths, and the new sizes are stored once a drag ends, not
 * on every move. The sizes are controlled, so a keyboard handle on each bar can step them as well.
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
import { getRootFontSizePixels } from '../../../utils/browser/get.root.font.size.pixels';
import type { ElementSizePx } from '../../../utils/hooks/interfaces/ElementSizePx';
import { useElementSizePx } from '../../../utils/hooks/use.element.size.px';
import { getPanelLimitsPercent } from '../../../utils/layout/get.panel.limits.percent';
import { getPanelSizePercents } from '../../../utils/layout/get.panel.size.percents';
import { getPercentText } from '../../../utils/layout/get.percent.text';
import { getSplitterStepPercent } from '../../../utils/layout/get.splitter.step.percent';
import type { PanelSizeLimitsPercent } from '../../../utils/layout/interfaces/PanelSizeLimitsPercent';
import type { PanelSizeLimitsPx } from '../../../utils/layout/interfaces/PanelSizeLimitsPx';
import {
  BED_PANEL_MIN_WIDTH_REM,
  DESIGN_PANEL_MAX_WIDTH_REM,
  DESIGN_PANEL_MIN_WIDTH_REM,
  MACHINE_PANEL_MAX_WIDTH_REM,
  MACHINE_PANEL_MIN_WIDTH_REM,
} from '../../../utils/layout.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { AppDispatch } from '../../../utils/states/new.store';
import { PanelSizesResized, selectPanelSizePercents } from '../../../utils/states/panel.layout.state';
import { SplitterHandles } from '../../../views/SplitterHandles';
import { getPanelDefaultSizes } from './get.panel.default.sizes';
import { getPanelOpeningPercents } from './get.panel.opening.percents';
import type { PanelDefaultSize } from './interfaces/PanelDefaultSize';
import type { PanelSplitterProps } from './interfaces/PanelSplitterProps';
import styles from './styles.module.scss';

/** The pixel limits of the design panel, the bed and the machine panel, left to right. */
const getPanelLimitsPx = (rootFontSizePx: number): PanelSizeLimitsPx[] => [
  { minPx: DESIGN_PANEL_MIN_WIDTH_REM * rootFontSizePx, maxPx: DESIGN_PANEL_MAX_WIDTH_REM * rootFontSizePx },
  { minPx: BED_PANEL_MIN_WIDTH_REM * rootFontSizePx, maxPx: undefined },
  { minPx: MACHINE_PANEL_MIN_WIDTH_REM * rootFontSizePx, maxPx: MACHINE_PANEL_MAX_WIDTH_REM * rootFontSizePx },
];

export const PanelSplitter = (props: PanelSplitterProps): ReactNode => {
  const { designPanelComponent, bedPanelComponent, machinePanelComponent } = props;
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const storedPanelSizePercents: number[] | undefined = useSelector(selectPanelSizePercents);
  const [rootFontSizePx] = useState<number>(getRootFontSizePixels);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wrapperSize: ElementSizePx = useElementSizePx(wrapperRef);
  const workbenchWidthPx: number = wrapperSize.widthPx;
  // The splitter reads its default sizes only when it mounts, so later stored sizes must not change them.
  const [panelDefaultSizes] = useState<PanelDefaultSize[]>(() => getPanelDefaultSizes({
    storedPanelSizePercents,
    rootFontSizePx,
    // The splitter spans the whole window width in the wide layout.
    workbenchWidthPx: window.innerWidth,
  }));
  // The sizes the user set by drag or key; until then the opening sizes, in percent once the workbench is measured.
  const [changedSizePercents, setSizePercents] = useState<number[] | undefined>(undefined);
  const sizePercents: number[] | undefined = changedSizePercents
    ?? (workbenchWidthPx ? getPanelOpeningPercents(panelDefaultSizes, workbenchWidthPx) : undefined);
  const panelLimitsPx: PanelSizeLimitsPx[] = getPanelLimitsPx(rootFontSizePx);
  const panelLimitsPercent: PanelSizeLimitsPercent[] = panelLimitsPx.map(
    (limitsPx: PanelSizeLimitsPx): PanelSizeLimitsPercent => getPanelLimitsPercent(limitsPx, workbenchWidthPx),
  );
  const [designLimits, bedLimits, machineLimits] = panelLimitsPx;
  const [designDefaultSize, bedDefaultSize, machineDefaultSize] = panelDefaultSizes;
  const [designSize, bedSize, machineSize] = sizePercents?.map(getPercentText) ?? [];

  const storePanelSizePercents = (panelSizePercents: number[]): void => {
    setSizePercents(panelSizePercents);
    dispatch(new PanelSizesResized({ panelSizePercents }));
  };

  const handlePanelResize = (panelSizesPx: number[]): void => {
    const panelSizePercents: number[] | undefined = getPanelSizePercents(panelSizesPx);

    if (panelSizePercents) {
      setSizePercents(panelSizePercents);
    }
  };

  const handlePanelResizeEnd = (panelSizesPx: number[]): void => {
    const panelSizePercents: number[] | undefined = getPanelSizePercents(panelSizesPx);

    if (panelSizePercents) {
      storePanelSizePercents(panelSizePercents);
    }
  };

  return (
    <div ref={wrapperRef} className={styles.panelSplitterWrapper}>
      <Splitter className={styles.panelSplitter} onResize={handlePanelResize} onResizeEnd={handlePanelResizeEnd}>
        <Splitter.Panel
          className={styles.splitterPanel}
          defaultSize={designDefaultSize}
          size={designSize}
          min={designLimits?.minPx}
          max={designLimits?.maxPx}
        >
          {designPanelComponent}
        </Splitter.Panel>
        <Splitter.Panel
          className={styles.splitterPanel}
          defaultSize={bedDefaultSize}
          size={bedSize}
          min={bedLimits?.minPx}
        >
          {bedPanelComponent}
        </Splitter.Panel>
        <Splitter.Panel
          className={styles.splitterPanel}
          defaultSize={machineDefaultSize}
          size={machineSize}
          min={machineLimits?.minPx}
          max={machineLimits?.maxPx}
        >
          {machinePanelComponent}
        </Splitter.Panel>
      </Splitter>
      {sizePercents && (
        <SplitterHandles
          sizePercents={sizePercents}
          limits={panelLimitsPercent}
          isVertical={false}
          stepPercent={getSplitterStepPercent(workbenchWidthPx, rootFontSizePx)}
          barLabels={[t(DEFAULT.LAYOUT_RESIZE_DESIGN_PANEL), t(DEFAULT.LAYOUT_RESIZE_MACHINE_PANEL)]}
          onSizesChange={storePanelSizePercents}
        />
      )}
    </div>
  );
};
