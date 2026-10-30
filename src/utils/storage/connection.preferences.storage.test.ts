import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONNECTION_PREFERENCES_STORAGE } from './connection.preferences.storage';
import type { ConnectionPreferences } from './interfaces/ConnectionPreferences';

const STORAGE_KEY = 'webgrbl.connectionPreferences';
const BLOCKED_MESSAGE = 'blocked';
const USB_PREFERENCES: ConnectionPreferences = {
  baudRate: 115200,
  portChoice: { isSimulated: false, usbVendorId: 0x1a86, usbProductId: 0x7523 },
};
const SIMULATED_PREFERENCES: ConnectionPreferences = {
  baudRate: 9600,
  portChoice: { isSimulated: true, usbVendorId: undefined, usbProductId: undefined },
};
const INVALID_STORED_TEXTS = [
  '{not json',
  '"text"',
  '{"baudRate":"fast","portChoice":{"isSimulated":true}}',
  '{"baudRate":9600}',
  '{"baudRate":9600,"portChoice":{"isSimulated":false,"usbVendorId":null}}',
  '{"baudRate":9600,"portChoice":{"isSimulated":false,"usbProductId":false}}',
];

describe('CONNECTION_PREFERENCES_STORAGE', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('round-trips stored preferences', () => {
    CONNECTION_PREFERENCES_STORAGE.storeConnectionPreferences(USB_PREFERENCES);

    expect(CONNECTION_PREFERENCES_STORAGE.getStoredConnectionPreferences()).toEqual(USB_PREFERENCES);
  });

  it('round-trips preferences without usb ids', () => {
    CONNECTION_PREFERENCES_STORAGE.storeConnectionPreferences(SIMULATED_PREFERENCES);

    expect(CONNECTION_PREFERENCES_STORAGE.getStoredConnectionPreferences()).toEqual(SIMULATED_PREFERENCES);
  });

  it('returns undefined when nothing is stored', () => {
    expect(CONNECTION_PREFERENCES_STORAGE.getStoredConnectionPreferences()).toBeUndefined();
  });

  it.each(INVALID_STORED_TEXTS)('returns undefined for corrupt or wrongly shaped value %s', (storedText: string) => {
    localStorage.setItem(STORAGE_KEY, storedText);

    expect(CONNECTION_PREFERENCES_STORAGE.getStoredConnectionPreferences()).toBeUndefined();
  });

  it('does not throw when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((): never => {
      throw new Error(BLOCKED_MESSAGE);
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((): never => {
      throw new Error(BLOCKED_MESSAGE);
    });

    expect(CONNECTION_PREFERENCES_STORAGE.getStoredConnectionPreferences()).toBeUndefined();
    expect(() => CONNECTION_PREFERENCES_STORAGE.storeConnectionPreferences(USB_PREFERENCES)).not.toThrow();
  });
});
