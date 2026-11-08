/**
 * The Position card, right above Move: the work position on X, Y and Z in one row beside the heading, so a user who
 * jogs sees where the laser is right next to the pad, and the card stays one line tall. The laser (machine) position
 * is in the row's tooltip. It only reads the status reports the machine already sends. While no laser is
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
import { CompassOutlined } from '@ant-design/icons';
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

const getAxisText = (position: GrblAxisPosition | undefined, axis: keyof GrblAxisPosition): string =>
  position ? position[axis].toFixed(POSITION_DECIMALS) : MISSING_VALUE_TEXT;

export const PositionCard = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConnected: boolean = useSelector(selectIsConnected);
  const status: GrblResolvedStatus | undefined = useSelector(selectMachineStatus);

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

  const laserPositionText: string = t(DEFAULT.MACHINE_POSITION_LASER_TOOLTIP, {
    x: getAxisText(status?.machinePosition, 'x'),
    y: getAxisText(status?.machinePosition, 'y'),
    z: getAxisText(status?.machinePosition, 'z'),
  });

  return (
    <Panel
      iconComponent={<CompassOutlined />}
      title={t(DEFAULT.MACHINE_POSITION_TITLE)}
      headerActionComponent={(
        <dl
          className={styles.positionRow}
          aria-label={t(DEFAULT.MACHINE_STATUS_WORK_POSITION)}
          title={laserPositionText}
        >
          {AXIS_KEYS.map((axis: keyof GrblAxisPosition) => (
            <div key={axis} className={styles.axis}>
              <dt>{t(AXIS_LABEL_KEYS[axis])}</dt>
              <dd>{getAxisText(status?.workPosition, axis)}</dd>
            </div>
          ))}
        </dl>
      )}
      isCompact
    />
  );
};
