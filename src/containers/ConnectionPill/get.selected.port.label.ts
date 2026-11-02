/**
 * Label of the port the app is set to use, as the port list shows it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import { SIMULATED_LASER_PORT_ID } from '../../utils/grbl/grbl.constants';
import type { SerialPortDescriptor } from '../../utils/grbl/interfaces/SerialPortDescriptor';
import { DEFAULT } from '../../utils/localization/default.locales';
import { getPortOptionLabel } from '../ConnectionPopover/get.port.option.label';

export const getSelectedPortLabel = (
  selectedPortId: string,
  availablePorts: SerialPortDescriptor[],
  t: TFunction,
): string => {
  const selectedPort: SerialPortDescriptor | undefined = availablePorts.find(
    (port: SerialPortDescriptor) => port.portId === selectedPortId,
  );

  if (selectedPortId === SIMULATED_LASER_PORT_ID) {
    return t(DEFAULT.CONNECTION_POPOVER_SIMULATED_LASER);
  }

  if (!selectedPort) {
    return t(DEFAULT.CONNECTION_NO_PORT_CHOSEN);
  }

  return getPortOptionLabel(selectedPort, t);
};
