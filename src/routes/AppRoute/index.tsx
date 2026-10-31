/**
 * Top-level page of the app: the workbench with the top bar, design panel, bed, machine panel and status strip,
 * plus the overlays. In a narrow window the regions stack and STOP moves to a sticky bar.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { BedPanel } from '../../containers/BedPanel';
import { DesignPanel } from '../../containers/DesignPanel';
import { LeavePageGuard } from '../../containers/LeavePageGuard';
import { MachinePanel } from '../../containers/MachinePanel';
import { StatusStrip } from '../../containers/StatusStrip';
import { StickyStopBar } from '../../containers/StickyStopBar';
import { ToastStack } from '../../containers/ToastStack';
import { TopBar } from '../../containers/TopBar';
import { useIsWideLayout } from '../../utils/hooks/use.is.wide.layout';
import styles from './styles.module.scss';

export const AppRoute = (): ReactNode => {
  const isWide: boolean = useIsWideLayout();

  return (
    <div className={styles.appRoute}>
      <div className={[styles.area, styles.topBarArea].join(' ')}>
        <TopBar />
      </div>
      <div className={[styles.area, styles.designArea].join(' ')}>
        <DesignPanel />
      </div>
      <div className={[styles.area, styles.bedArea].join(' ')}>
        <BedPanel />
      </div>
      <div className={[styles.area, styles.machineArea].join(' ')}>
        <MachinePanel />
      </div>
      <div className={[styles.area, styles.statusArea].join(' ')}>
        <StatusStrip />
      </div>
      {!isWide && <StickyStopBar />}
      <ToastStack />
      <LeavePageGuard />
    </div>
  );
};
