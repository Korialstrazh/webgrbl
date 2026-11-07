/**
 * The compact Status card of the machine panel, right above Position: the state in its header, then one line with feed
 * and power under short captions, and Reset and Unlock. The positions sit in the Position card. While no laser is
 * connected it is not shown: the top-bar pill alone tells the connection state.
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
import { MachineStateReadout } from '../MachineStateReadout';
import { MachineStatusRow } from '../MachineStatusRow';

export const MachineStatusCard = (): ReactNode => {
  const { t } = useTranslation();
  const isConnected: boolean = useSelector(selectIsConnected);

  if (!isConnected) {
    return null;
  }

  return (
    <Panel
      iconComponent={<DashboardOutlined />}
      title={t(DEFAULT.MACHINE_STATUS_TITLE)}
      headerActionComponent={<MachineStateReadout />}
    >
      <MachineStatusRow />
    </Panel>
  );
};
