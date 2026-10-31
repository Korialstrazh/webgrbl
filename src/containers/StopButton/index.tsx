/**
 * The one STOP button: sends the stop request and can be pressed whenever the laser is connected.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectIsConnected } from '../../utils/states/grbl.connection.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { Button } from '../../views/Button';
import { BUTTON_SIZE, BUTTON_VARIANT } from '../../views/Button/button.constants';

export const StopButton = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isConnected: boolean = useSelector(selectIsConnected);

  return (
    <Button
      variant={BUTTON_VARIANT.DANGER}
      size={BUTTON_SIZE.LARGE}
      isDisabled={!isConnected}
      onClick={() => dispatch(new MachineStopRequested())}
    >
      {t(DEFAULT.MACHINE_CONTROL_STOP)}
    </Button>
  );
};
