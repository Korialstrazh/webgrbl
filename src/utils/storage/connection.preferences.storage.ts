import { isBoolean } from '../type.guards/is.boolean';
import { isFiniteNumber } from '../type.guards/is.finite.number';
import { isRecord } from '../type.guards/is.record';
import type { ConnectionPreferences } from './interfaces/ConnectionPreferences';

/** localStorage key of the remembered connection choices. */
const CONNECTION_PREFERENCES_STORAGE_KEY = 'webgrbl.connectionPreferences';

const isOptionalNumber = (value: unknown): value is number | undefined => !value || isFiniteNumber(value);

const isConnectionPreferences = (value: unknown): value is ConnectionPreferences => {
  if (!isRecord(value) || !isFiniteNumber(value.baudRate) || !isRecord(value.portChoice)) {
    return false;
  }

  const { isSimulated, usbVendorId, usbProductId } = value.portChoice;

  return isBoolean(isSimulated) && isOptionalNumber(usbVendorId) && isOptionalNumber(usbProductId);
};

/**
 * Keeps the connection choices (baud rate, simulated laser or USB port) in localStorage. Storage can be
 * blocked or full, so every access is guarded and a failure reads as "nothing stored".
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const CONNECTION_PREFERENCES_STORAGE = {
  getStoredConnectionPreferences(): ConnectionPreferences | undefined {
    try {
      const storedText: string | null = localStorage.getItem(CONNECTION_PREFERENCES_STORAGE_KEY);

      if (!storedText) {
        return undefined;
      }

      const parsedValue: unknown = JSON.parse(storedText);

      return isConnectionPreferences(parsedValue) ? parsedValue : undefined;
    } catch {
      return undefined;
    }
  },

  storeConnectionPreferences(preferences: ConnectionPreferences): void {
    try {
      localStorage.setItem(CONNECTION_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Storage can be blocked or full; the choice is then simply not remembered.
    }
  },
};
