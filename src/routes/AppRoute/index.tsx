/**
 * Top-level page of the app: the workbench with the top bar, design panel, bed, machine panel and status strip,
 * plus the overlays. It fills the window as an antd Layout; in a narrow window a segmented bar shows one region at a
 * time, the bed first so the first screen shows the work, and Start and STOP move to a sticky bar. It shares the bed
 * region element, which bed-region
 * dialogs and drawers render into.
 *
 * In a wide window the three panels sit in a splitter the user can resize, and the console, while open, sits below the
 * bed in a second, vertical splitter. The splitters wait until the stored panel sizes are read, a quick IndexedDB read
 * with a timeout, so the workbench opens with them instead of jumping from the defaults. In a narrow window the open
 * console is a bottom sheet over the region on screen.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Layout } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { BedPanel } from '../../containers/BedPanel';
import { DesignPanel } from '../../containers/DesignPanel';
import { GcodeExportConfirmDialog } from '../../containers/GcodeExportConfirmDialog';
import { HistoryHotkeys } from '../../containers/HistoryHotkeys';
import { LeavePageGuard } from '../../containers/LeavePageGuard';
import { MachinePanel } from '../../containers/MachinePanel';
import { PointerHotkey } from '../../containers/PointerHotkey';
import { SaveHotkey } from '../../containers/SaveHotkey';
import { StatusStrip } from '../../containers/StatusStrip';
import { StickyStopBar } from '../../containers/StickyStopBar';
import { StopHotkey } from '../../containers/StopHotkey';
import { TooltipDismissal } from '../../containers/TooltipDismissal';
import { TopBar } from '../../containers/TopBar';
import { NarrowRegionBar } from '../../containers/NarrowRegionBar';
import { BedRegionHostContext } from '../../utils/bed/bed.region.host.context';
import { useIsWideLayout } from '../../utils/hooks/use.is.wide.layout';
import { selectIsConsoleOpen, selectIsPanelLayoutLoaded } from '../../utils/states/panel.layout.state';
import { selectNarrowRegion } from '../../utils/states/ui.workbench.state';
import { WORKBENCH_REGION } from '../../utils/states/workbench.region.constants';
import type { WorkbenchRegion } from '../../utils/states/workbench.region.constants';
import { BedColumnSplitter } from './BedColumnSplitter';
import { ConsoleDock } from './ConsoleDock';
import { PanelSplitter } from './PanelSplitter';
import styles from './styles.module.scss';

const getNarrowRegionClassName = (shownRegion: WorkbenchRegion, region: WorkbenchRegion): string =>
  [styles.narrowRegion, shownRegion === region ? undefined : styles.hiddenRegion].join(' ');

export const AppRoute = (): ReactNode => {
  const isWide: boolean = useIsWideLayout();
  const [bedRegionHost, setBedRegionHost] = useState<HTMLElement | null>(null);
  const isPanelLayoutLoaded: boolean = useSelector(selectIsPanelLayoutLoaded);
  const isConsoleOpen: boolean = useSelector(selectIsConsoleOpen);
  const narrowRegion: WorkbenchRegion = useSelector(selectNarrowRegion);
  // With the console sheet open the regions end above it, so the bed re-fits to the space left.
  const narrowRegionsClassName: string = [
    styles.narrowRegions,
    isConsoleOpen ? styles.narrowRegionsWithSheet : undefined,
  ].join(' ');
  const designPanelComponent: ReactNode = <DesignPanel />;
  const bedPanelComponent: ReactNode = <BedPanel hostRef={isWide ? setBedRegionHost : undefined} isWide={isWide} />;
  const machinePanelComponent: ReactNode = <MachinePanel isWide={isWide} />;

  return (
    <BedRegionHostContext value={bedRegionHost}>
      <Layout className={styles.appRoute} hasSider={false}>
        <TopBar />
        {!isWide && <NarrowRegionBar />}
        {isWide ? (
          <Layout className={styles.regions} hasSider>
            {isPanelLayoutLoaded && (
              <PanelSplitter
                designPanelComponent={designPanelComponent}
                bedPanelComponent={<BedColumnSplitter bedPanelComponent={bedPanelComponent} />}
                machinePanelComponent={machinePanelComponent}
              />
            )}
          </Layout>
        ) : (
          // All regions stay mounted, so a hidden one keeps its state. Dialogs and drawers open in this box, not in the
          // bed region, so they show over whichever region is on screen and take its full height.
          <div ref={setBedRegionHost} className={narrowRegionsClassName}>
            <div className={getNarrowRegionClassName(narrowRegion, WORKBENCH_REGION.BED)}>
              {bedPanelComponent}
            </div>
            <div className={getNarrowRegionClassName(narrowRegion, WORKBENCH_REGION.DESIGN)}>
              {designPanelComponent}
            </div>
            <div className={getNarrowRegionClassName(narrowRegion, WORKBENCH_REGION.JOB)}>
              {machinePanelComponent}
            </div>
            {/* A sheet over whichever region shows; it stays inside this box, so STOP below it stays free. */}
            {isConsoleOpen && <ConsoleDock />}
          </div>
        )}
        <StatusStrip />
        {!isWide && <StickyStopBar />}
        <LeavePageGuard />
        <StopHotkey />
        <PointerHotkey />
        <HistoryHotkeys />
        <SaveHotkey />
        <TooltipDismissal />
        <GcodeExportConfirmDialog />
      </Layout>
    </BedRegionHostContext>
  );
};
