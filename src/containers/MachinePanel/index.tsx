/**
 * The right region: machine status, reset and unlock, the coming-soon cards and, in a wide window, STOP at the bottom.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Layout } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MACHINE_PANEL_WIDTH } from '../../utils/layout.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { Panel } from '../../views/Panel';
import { StopButton } from '../StopButton';
import type { MachinePanelProps } from './interfaces/MachinePanelProps';
import { LaserCard } from './LaserCard';
import { MachineResetUnlock } from './MachineResetUnlock';
import { MachineStateReadout } from './MachineStateReadout';
import { MoveCard } from './MoveCard';
import { PreflightCard } from './PreflightCard';
import { StartJobCard } from './StartJobCard';
import styles from './styles.module.scss';

export const MachinePanel = ({ isWide }: MachinePanelProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <Layout.Sider
      className={styles.region}
      classNames={{ body: styles.machinePanel }}
      width={MACHINE_PANEL_WIDTH}
      aria-label={t(DEFAULT.MACHINE_PANEL_TITLE)}
    >
      <div className={styles.cards}>
        <Panel title={t(DEFAULT.MACHINE_STATUS_TITLE)}>
          <MachineStateReadout />
          <MachineResetUnlock />
        </Panel>
        <MoveCard />
        <LaserCard />
        <PreflightCard />
        <StartJobCard />
      </div>
      {isWide && (
        <div className={styles.stopArea}>
          <StopButton />
        </div>
      )}
    </Layout.Sider>
  );
};
