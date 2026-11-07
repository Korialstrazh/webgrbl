/**
 * The Position card, right above Move: the work and laser positions on X, Y and Z, so a user who jogs sees where the
 * laser is right next to the pad. It only reads the status reports the machine already sends. While no laser is
 * connected it keeps its heading with a plug badge and shows no numbers. The state, feed, power, Reset and Unlock sit
 * in the compact Status card above it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { AimOutlined, CompassOutlined, HomeOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { GrblAxisPosition } from '../../../utils/grbl/interfaces/GrblAxisPosition';
import type { GrblResolvedStatus } from '../../../utils/grbl/interfaces/GrblResolvedStatus';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { MISSING_VALUE_TEXT } from '../../../utils/missing.value.constants';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import { selectMachineStatus } from '../../../utils/states/machine.status.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { ConnectionPopoverOpenChanged } from '../../../utils/states/ui.overlay.state';
import { Panel } from '../../../views/Panel';
import { PlugBadge } from '../../../views/PlugBadge';
import styles from './styles.module.scss';

const POSITION_DECIMALS = 3;
const AXIS_KEYS: readonly (keyof GrblAxisPosition)[] = ['x', 'y', 'z'];
const AXIS_LABEL_KEYS: Readonly<Record<keyof GrblAxisPosition, string>> = {
  x: DEFAULT.MACHINE_POSITION_AXIS_X,
  y: DEFAULT.MACHINE_POSITION_AXIS_Y,
  z: DEFAULT.MACHINE_POSITION_AXIS_Z,
};

interface PositionRow {
  key: string;
  iconComponent: ReactNode;
  captionKey: string;
  /** The full name: the row's accessible name and its tooltip. */
  labelKey: string;
  position: GrblAxisPosition | undefined;
}

const getAxisText = (position: GrblAxisPosition | undefined, axis: keyof GrblAxisPosition): string =>
  position ? position[axis].toFixed(POSITION_DECIMALS) : MISSING_VALUE_TEXT;

export const PositionCard = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConnected: boolean = useSelector(selectIsConnected);
  const status: GrblResolvedStatus | undefined = useSelector(selectMachineStatus);
  const rows: PositionRow[] = [
    {
      key: 'work',
      iconComponent: <AimOutlined />,
      captionKey: DEFAULT.MACHINE_POSITION_WORK_CAPTION,
      labelKey: DEFAULT.MACHINE_STATUS_WORK_POSITION,
      position: status?.workPosition,
    },
    {
      key: 'laser',
      iconComponent: <HomeOutlined />,
      captionKey: DEFAULT.MACHINE_POSITION_LASER_CAPTION,
      labelKey: DEFAULT.MACHINE_STATUS_MACHINE_POSITION,
      position: status?.machinePosition,
    },
  ];

  if (!isConnected) {
    return (
      <Panel
        iconComponent={<CompassOutlined />}
        title={t(DEFAULT.MACHINE_POSITION_TITLE)}
        headerActionComponent={(
          <PlugBadge
            reasonText={t(DEFAULT.MACHINE_POSITION_DISCONNECTED)}
            onClick={() => dispatch(new ConnectionPopoverOpenChanged({ isConnectionPopoverOpen: true }))}
          />
        )}
      />
    );
  }

  return (
    <Panel iconComponent={<CompassOutlined />} title={t(DEFAULT.MACHINE_POSITION_TITLE)}>
      <table className={styles.positionTable}>
        <thead>
          <tr>
            <td />
            {AXIS_KEYS.map((axis: keyof GrblAxisPosition) => (
              <th key={axis} scope="col">{t(AXIS_LABEL_KEYS[axis])}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: PositionRow) => (
            <tr key={row.key}>
              <th scope="row" title={t(row.labelKey)} aria-label={t(row.labelKey)}>
                <span className={styles.rowIcon} aria-hidden>{row.iconComponent}</span>
                <span aria-hidden>{t(row.captionKey)}</span>
              </th>
              {AXIS_KEYS.map((axis: keyof GrblAxisPosition) => (
                <td key={axis}>{getAxisText(row.position, axis)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
};
