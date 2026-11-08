/**
 * The controls of the move card: home, set zero, the jog pad, the step sizes and the jog speed, centred as one column.
 * Each one is enabled only while the laser can take that move.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { AimOutlined, ArrowUpOutlined, HomeOutlined } from '@ant-design/icons';
import { Button, Segmented, Tooltip } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_LARGE } from '../../../../utils/antd.constants';
import type { GrblResolvedStatus } from '../../../../utils/grbl/interfaces/GrblResolvedStatus';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { getGoToWorkZeroCommand } from '../../../../utils/machine/get.go.to.work.zero.command';
import { getJogCommand } from '../../../../utils/machine/get.jog.command';
import { getMoveAvailability } from '../../../../utils/machine/get.move.availability';
import type { MoveAvailability } from '../../../../utils/machine/interfaces/MoveAvailability';
import { DEFAULT_JOG_STEP_MM, JOG_STEP_SIZES_MM } from '../../../../utils/machine/machine.command.constants';
import { MACHINE_COMMAND } from '../../../../utils/machine/machine.commands';
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';
import { DEFAULT_MACHINE_JOG_FEED_RATE } from '../../../../utils/profiles/machine.profile.constants';
import { selectIsConnected } from '../../../../utils/states/grbl.connection.state';
import { selectIsJobRunActive } from '../../../../utils/states/job.run.state';
import { selectIsLaserPointerFiring } from '../../../../utils/states/laser.pointer.state';
import { selectActiveMachineProfile } from '../../../../utils/states/machine.profile.state';
import { MachineLineRequested, selectMachineStatus } from '../../../../utils/states/machine.status.state';
import type { AppDispatch } from '../../../../utils/states/new.store';
import type { JogPadCell } from '../interfaces/JogPadCell';
import type { JogStepOption } from '../interfaces/JogStepOption';
import type { MoveControlsProps } from '../interfaces/MoveControlsProps';
import { JogSpeedInput } from '../JogSpeedInput';
import { JOG_PAD_CELLS } from '../jog.pad.constants';
import styles from './styles.module.scss';
import { SCRIPT_FOCUS_ONLY_TAB_INDEX } from '../../../../utils/tab.index.constants';

// eslint-disable-next-line no-restricted-syntax -- 0 degrees is a real turn, the up arrow
const isJogArrowCell = (cell: JogPadCell): boolean => cell.arrowRotationDeg !== undefined;

export const MoveControls = ({ id }: MoveControlsProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConnected: boolean = useSelector(selectIsConnected);
  const machineStatus: GrblResolvedStatus | undefined = useSelector(selectMachineStatus);
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const isPointerFiring: boolean = useSelector(selectIsLaserPointerFiring);
  const isJobRunActive: boolean = useSelector(selectIsJobRunActive);
  const [stepMm, setStepMm] = useState<number>(DEFAULT_JOG_STEP_MM);
  const feedRate: number = activeProfile?.jogFeedRate ?? DEFAULT_MACHINE_JOG_FEED_RATE;
  const { canJog, canHome, canSetZero }: MoveAvailability = getMoveAvailability({
    isConnected,
    machineState: machineStatus?.machineState,
    hasHomingSwitches: activeProfile?.hasHomingSwitches ?? false,
    isPointerFiring,
    isJobRunActive,
  });
  const stepOptions: JogStepOption[] = JOG_STEP_SIZES_MM.map((distance: number) => ({
    value: distance,
    label: t(DEFAULT.MACHINE_MOVE_STEP_OPTION, { distance }),
  }));

  const stepText: string = t(DEFAULT.MACHINE_MOVE_STEP_OPTION, { distance: stepMm });

  const requestLine = (line: string): void => {
    dispatch(new MachineLineRequested({ line }));
  };

  const requestJogPadLine = (cell: JogPadCell): void => {
    requestLine(cell.direction ? getJogCommand(cell.direction, stepMm, feedRate) : getGoToWorkZeroCommand(feedRate));
  };

  return (
    <div id={id} className={styles.moveControls}>
      <div className={styles.jogPad}>
        {JOG_PAD_CELLS.map((cell: JogPadCell) => (
          <Tooltip key={cell.labelKey} title={isJogArrowCell(cell) ? undefined : t(cell.labelKey)}>
            <Button
              size={ANTD_BUTTON_SIZE_LARGE}
              disabled={!canJog}
              icon={isJogArrowCell(cell) ? <ArrowUpOutlined rotate={cell.arrowRotationDeg} /> : <HomeOutlined />}
              aria-label={t(cell.labelKey)}
              onClick={() => requestJogPadLine(cell)}
            >
              {/* The active step, in the middle of the arrows it applies to; shown only, never a control. */}
              {!isJogArrowCell(cell) && (
                <span className={styles.stepReadout} aria-hidden="true">{stepText}</span>
              )}
            </Button>
          </Tooltip>
        ))}
      </div>
      <div className={styles.stepAndSpeed}>
        <Segmented
          // One tab stop: the checked option. antd also makes the group box focusable, a second stop with no use.
          tabIndex={SCRIPT_FOCUS_ONLY_TAB_INDEX}
          aria-label={t(DEFAULT.MACHINE_MOVE_STEP_LABEL)}
          options={stepOptions}
          value={stepMm}
          onChange={setStepMm}
        />
        {/* Beside the jog speed, so the whole Move card fits on a 900 px high screen. */}
        <div className={styles.speedRow}>
          <JogSpeedInput />
          {activeProfile?.hasHomingSwitches && (
            <Button
              size={ANTD_BUTTON_SIZE_LARGE}
              icon={<HomeOutlined />}
              aria-label={t(DEFAULT.MACHINE_MOVE_HOME)}
              disabled={!canHome}
              onClick={() => requestLine(MACHINE_COMMAND.HOME)}
            >
              {t(DEFAULT.MACHINE_MOVE_HOME)}
            </Button>
          )}
          <Button
            size={ANTD_BUTTON_SIZE_LARGE}
            icon={<AimOutlined />}
            aria-label={t(DEFAULT.MACHINE_MOVE_SET_ZERO)}
            disabled={!canSetZero}
            onClick={() => requestLine(MACHINE_COMMAND.SET_WORK_ZERO)}
          >
            {t(DEFAULT.MACHINE_MOVE_SET_ZERO)}
          </Button>
        </div>
      </div>
    </div>
  );
};
