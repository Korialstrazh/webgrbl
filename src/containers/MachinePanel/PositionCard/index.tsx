/**
 * The Position card, right above Move, in two rows: the heading with a small Set zero button at its right end, then
 * the work position on X, Y and Z, so a user who jogs sees where the laser is right next to the pad and sets the work
 * zero where it now stands. The laser (machine) position
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
import { AimOutlined, CompassOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { GrblAxisPosition } from '../../../utils/grbl/interfaces/GrblAxisPosition';
import type { GrblResolvedStatus } from '../../../utils/grbl/interfaces/GrblResolvedStatus';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getMoveAvailability } from '../../../utils/machine/get.move.availability';
import type { MoveAvailability } from '../../../utils/machine/interfaces/MoveAvailability';
import { MACHINE_COMMAND } from '../../../utils/machine/machine.commands';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import { selectIsJobRunActive } from '../../../utils/states/job.run.state';
import { selectIsLaserPointerFiring } from '../../../utils/states/laser.pointer.state';
import { selectActiveMachineProfile } from '../../../utils/states/machine.profile.state';
import { MISSING_VALUE_TEXT } from '../../../utils/missing.value.constants';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import { MachineLineRequested, selectMachineStatus } from '../../../utils/states/machine.status.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { ConnectionPopoverOpenChanged } from '../../../utils/states/ui.overlay.state';
import { IconActionButton } from '../../../views/IconActionButton';
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
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const isPointerFiring: boolean = useSelector(selectIsLaserPointerFiring);
  const isJobRunActive: boolean = useSelector(selectIsJobRunActive);
  // The same guards as the jog pad: idle, connected, no job and no pointer firing.
  const { canSetZero }: MoveAvailability = getMoveAvailability({
    isConnected,
    machineState: status?.machineState,
    hasHomingSwitches: activeProfile?.hasHomingSwitches ?? false,
    isPointerFiring,
    isJobRunActive,
  });

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
        <IconActionButton
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_SMALL}
          labelText={t(DEFAULT.MACHINE_POSITION_SET_ZERO)}
          iconComponent={<AimOutlined />}
          isDisabled={!canSetZero}
          onClick={() => dispatch(new MachineLineRequested({ line: MACHINE_COMMAND.SET_WORK_ZERO }))}
        />
      )}
      isCompact
    >
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
    </Panel>
  );
};
