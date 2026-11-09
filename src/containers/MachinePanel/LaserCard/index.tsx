/**
 * The laser pointer card, one row: hold to fire, the pointer power of the active laser profile and its figure, and a
 * details button whose popover holds the watts, the switch-off note and air assist. While no laser is connected none
 * of them can act, so the card is its heading line with a Show button that opens the row anyway, disabled.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { AimOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Slider } from 'antd';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import {
  MAX_POINTER_POWER_PERCENT,
  MIN_POINTER_POWER_PERCENT,
  POINTER_POWER_STEP_PERCENT,
} from '../../../utils/machine/machine.command.constants';
import { selectIsConnected } from '../../../utils/states/grbl.connection.state';
import { LaserPointerPowerChanged } from '../../../utils/states/laser.pointer.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { selectPointerPowerPercent } from '../../../utils/states/pointer.power.selector';
import { ConnectionPopoverOpenChanged } from '../../../utils/states/ui.overlay.state';
import { CollapsedCardToggle } from '../../../views/CollapsedCardToggle';
import { Panel } from '../../../views/Panel';
import { PointerDetailsButton } from './PointerDetailsButton';
import { PointerFireButton } from './PointerFireButton';
import styles from './styles.module.scss';

export const LaserCard = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConnected: boolean = useSelector(selectIsConnected);
  const powerPercent: number = useSelector(selectPointerPowerPercent);
  const [isShownWhileDisconnected, setIsShownWhileDisconnected] = useState<boolean>(false);
  const controlsId: string = useId();
  const isCollapsed: boolean = !isConnected && !isShownWhileDisconnected;
  const toggleLabelKey: string = isCollapsed
    ? DEFAULT.MACHINE_LASER_SHOW_CONTROLS_LABEL
    : DEFAULT.MACHINE_LASER_HIDE_CONTROLS_LABEL;
  const collapseToggleComponent: ReactNode = isConnected ? undefined : (
    <CollapsedCardToggle
      isCollapsed={isCollapsed}
      hintText={t(DEFAULT.MACHINE_LASER_COLLAPSED_HINT)}
      controlsId={controlsId}
      toggleLabel={t(toggleLabelKey)}
      onToggle={() => setIsShownWhileDisconnected(isCollapsed)}
      onPlugClick={() => dispatch(new ConnectionPopoverOpenChanged({ isConnectionPopoverOpen: true }))}
    />
  );

  return (
    <Panel
      iconComponent={<AimOutlined />}
      title={t(DEFAULT.MACHINE_LASER_TITLE)}
      headerActionComponent={collapseToggleComponent}
      isCompact
    >
      {isCollapsed ? undefined : (
        <div id={controlsId} className={styles.laserCard}>
          <PointerFireButton />
          <ThunderboltOutlined className={styles.powerIcon} aria-hidden />
          <Slider
            className={styles.powerSlider}
            min={MIN_POINTER_POWER_PERCENT}
            max={MAX_POINTER_POWER_PERCENT}
            step={POINTER_POWER_STEP_PERCENT}
            value={powerPercent}
            tooltip={{ open: false }}
            onChange={(percent: number) => dispatch(new LaserPointerPowerChanged({ percent }))}
            ariaLabelForHandle={t(DEFAULT.MACHINE_LASER_POWER)}
          />
          <output className={styles.powerValue} aria-hidden>
            {t(DEFAULT.MACHINE_LASER_POWER_PERCENT, { percent: powerPercent })}
          </output>
          <PointerDetailsButton />
        </div>
      )}
    </Panel>
  );
};
