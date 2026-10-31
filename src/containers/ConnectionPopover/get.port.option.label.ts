/**
 * Label of a granted serial port in the port list: its USB ids, or a generic name when the browser gave none.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import type { SerialPortDescriptor } from '../../utils/grbl/interfaces/SerialPortDescriptor';
import { DEFAULT } from '../../utils/localization/default.locales';
import { getUsbIdHex } from './get.usb.id.hex';

export const getPortOptionLabel = (port: SerialPortDescriptor, t: TFunction): string => {
  const { usbVendorId, usbProductId } = port;

  // Id 0 is a valid USB id, so only a missing id means the browser gave none.
  // eslint-disable-next-line no-restricted-syntax -- 0 is distinct from absent here
  if (usbVendorId === undefined || usbProductId === undefined) {
    return t(DEFAULT.CONNECTION_POPOVER_SERIAL_PORT);
  }

  return t(DEFAULT.CONNECTION_POPOVER_USB_PORT, {
    vendorId: getUsbIdHex(usbVendorId),
    productId: getUsbIdHex(usbProductId),
  });
};
