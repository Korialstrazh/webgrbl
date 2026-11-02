/**
 * Top-level page of the app: the workbench with the top bar, design panel, bed, machine panel and status strip,
 * plus the overlays. It fills the window as an antd Layout; in a narrow window the regions stack and STOP moves to a
 * sticky bar. It shares the bed region element, which dialogs and drawers render into.
 *
 * In a wide window the three panels sit in a splitter the user can resize. The splitter waits until the stored panel
 * sizes are read, a quick IndexedDB read, so the workbench opens with them instead of jumping from the defaults. The
 * resized column widths also go into custom properties, so the console overlay lines up with the columns.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Layout } from 'antd';
import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { BedPanel } from '../../containers/BedPanel';
import { DesignPanel } from '../../containers/DesignPanel';
import { GcodeExportConfirmDialog } from '../../containers/GcodeExportConfirmDialog';
import { HistoryHotkeys } from '../../containers/HistoryHotkeys';
import { LeavePageGuard } from '../../containers/LeavePageGuard';
import { MachinePanel } from '../../containers/MachinePanel';
import { SaveHotkey } from '../../containers/SaveHotkey';
import { StatusStrip } from '../../containers/StatusStrip';
import { StickyStopBar } from '../../containers/StickyStopBar';
import { StopHotkey } from '../../containers/StopHotkey';
import { TopBar } from '../../containers/TopBar';
import { BedRegionHostContext } from '../../utils/bed/bed.region.host.context';
import { useIsWideLayout } from '../../utils/hooks/use.is.wide.layout';
import { setWorkbenchColumnWidthProperties } from '../../utils/layout/set.workbench.column.width.properties';
import { selectIsPanelLayoutLoaded, selectPanelSizePercents } from '../../utils/states/panel.layout.state';
import { PanelSplitter } from './PanelSplitter';
import styles from './styles.module.scss';

export const AppRoute = (): ReactNode => {
  const isWide: boolean = useIsWideLayout();
  const [bedRegionHost, setBedRegionHost] = useState<HTMLElement | null>(null);
  const appRouteRef = useRef<HTMLElement>(null);
  const panelSizePercents: number[] | undefined = useSelector(selectPanelSizePercents);
  const isPanelLayoutLoaded: boolean = useSelector(selectIsPanelLayoutLoaded);
  const designPanelComponent: ReactNode = <DesignPanel />;
  const bedPanelComponent: ReactNode = <BedPanel hostRef={setBedRegionHost} isWide={isWide} />;
  const machinePanelComponent: ReactNode = <MachinePanel isWide={isWide} />;

  useLayoutEffect(() => {
    setWorkbenchColumnWidthProperties(appRouteRef.current, panelSizePercents);
  }, [panelSizePercents]);

  // Set on the element directly while dragging, so a drag does not render the whole workbench on every move.
  const handlePanelResize = (resizedPanelSizePercents: number[]): void =>
    setWorkbenchColumnWidthProperties(appRouteRef.current, resizedPanelSizePercents);

  return (
    <BedRegionHostContext value={bedRegionHost}>
      <Layout ref={appRouteRef} className={styles.appRoute}>
        <TopBar />
        <Layout className={styles.regions} hasSider={isWide}>
          {isWide
            ? isPanelLayoutLoaded && (
              <PanelSplitter
                designPanelComponent={designPanelComponent}
                bedPanelComponent={bedPanelComponent}
                machinePanelComponent={machinePanelComponent}
                onPanelResize={handlePanelResize}
              />
            )
            : (
              <>
                {designPanelComponent}
                {bedPanelComponent}
                {machinePanelComponent}
              </>
            )}
        </Layout>
        <StatusStrip />
        {!isWide && <StickyStopBar />}
        <LeavePageGuard />
        <StopHotkey />
        <HistoryHotkeys />
        <SaveHotkey />
        <GcodeExportConfirmDialog />
      </Layout>
    </BedRegionHostContext>
  );
};
