/**
 * Label of the port the app is set to use, as the port list shows it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
