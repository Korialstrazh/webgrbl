/**
 * Writes a USB vendor or product id as four lowercase hex digits.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

const HEX_RADIX = 16;
const USB_ID_HEX_DIGITS = 4;
const HEX_PADDING = '0';

export const getUsbIdHex = (usbId: number): string =>
  usbId.toString(HEX_RADIX).padStart(USB_ID_HEX_DIGITS, HEX_PADDING);
