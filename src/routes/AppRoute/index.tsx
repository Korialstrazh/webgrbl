/**
 * Top-level page of the app: the workbench with the top bar, design panel, bed, machine panel and status strip,
 * plus the overlays. It fills the window as an antd Layout; in a narrow window the regions stack and STOP moves to a
 * sticky bar. It shares the bed region element, which dialogs and drawers render into.
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
import { BedPanel } from '../../containers/BedPanel';
import { DesignPanel } from '../../containers/DesignPanel';
import { LeavePageGuard } from '../../containers/LeavePageGuard';
import { MachinePanel } from '../../containers/MachinePanel';
import { StatusStrip } from '../../containers/StatusStrip';
import { StickyStopBar } from '../../containers/StickyStopBar';
import { StopHotkey } from '../../containers/StopHotkey';
import { TopBar } from '../../containers/TopBar';
import { BedRegionHostContext } from '../../utils/bed/bed.region.host.context';
import { useIsWideLayout } from '../../utils/hooks/use.is.wide.layout';
import styles from './styles.module.scss';

export const AppRoute = (): ReactNode => {
  const isWide: boolean = useIsWideLayout();
  const [bedRegionHost, setBedRegionHost] = useState<HTMLElement | null>(null);

  return (
    <BedRegionHostContext value={bedRegionHost}>
      <Layout className={styles.appRoute}>
        <TopBar />
        <Layout className={styles.regions} hasSider={isWide}>
          <DesignPanel />
          <BedPanel hostRef={setBedRegionHost} isWide={isWide} />
          <MachinePanel isWide={isWide} />
        </Layout>
        <StatusStrip />
        {!isWide && <StickyStopBar />}
        <LeavePageGuard />
        <StopHotkey />
      </Layout>
    </BedRegionHostContext>
  );
};
