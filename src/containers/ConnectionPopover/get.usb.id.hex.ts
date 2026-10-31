/**
 * Writes a USB vendor or product id as four lowercase hex digits.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

const HEX_RADIX = 16;
const USB_ID_HEX_DIGITS = 4;
const HEX_PADDING = '0';

export const getUsbIdHex = (usbId: number): string =>
  usbId.toString(HEX_RADIX).padStart(USB_ID_HEX_DIGITS, HEX_PADDING);
