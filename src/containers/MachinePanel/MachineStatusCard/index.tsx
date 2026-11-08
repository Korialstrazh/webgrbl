/**
 * The compact Status card of the machine panel, right above Position, in a single line: the state badge, feed and power
 * with their icons and units, then Reset and Unlock as small icon buttons. Its heading is read by screen readers only,
 * so the line fits the column and Move stays in view. The positions sit in the Position card. While no laser
 * is connected it is not shown: the top-bar pill alone tells the connection state.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import { Panel } from '../../../views/Panel';
import { MachineResetUnlock } from '../MachineResetUnlock';
import { MachineStatusRow } from '../MachineStatusRow';
import styles from './styles.module.scss';

export const MachineStatusCard = (): ReactNode => {
  const { t } = useTranslation();
  const isConnected: boolean = useSelector(selectIsConnected);

  if (!isConnected) {
    return null;
  }

  return (
    <Panel
      title={t(DEFAULT.MACHINE_STATUS_TITLE)}
      headerActionComponent={(
        <div className={styles.statusLine}>
          <MachineStatusRow />
          <MachineResetUnlock />
        </div>
      )}
      isCompact
      isTitleVisuallyHidden
    />
  );
};
