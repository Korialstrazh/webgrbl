/**
 * The Status card of the machine panel. It shows the state, positions, feed and power with Reset and Unlock. While no
 * laser is connected it is not shown: the top-bar pill alone tells the connection state.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DashboardOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import { Panel } from '../../../views/Panel';
import { MachineResetUnlock } from '../MachineResetUnlock';
import { MachineStateReadout } from '../MachineStateReadout';

export const MachineStatusCard = (): ReactNode => {
  const { t } = useTranslation();
  const isConnected: boolean = useSelector(selectIsConnected);

  if (!isConnected) {
    return null;
  }

  return (
    <Panel iconComponent={<DashboardOutlined />} title={t(DEFAULT.MACHINE_STATUS_TITLE)}>
      <MachineStateReadout />
      <MachineResetUnlock />
    </Panel>
  );
};
