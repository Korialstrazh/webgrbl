/**
 * Tells whether the device runs on battery power: true when the Battery API says it is not charging, undefined where
 * the API is missing or refuses, as in Firefox and Safari. The caller treats undefined as no hint.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

/** The part of the Battery Status API this app reads; lib.dom has no type for it. */
interface BatteryStatus {
  charging: boolean;
}

interface NavigatorWithBattery {
  getBattery?: () => Promise<BatteryStatus>;
}

export const getIsOnBattery = async (): Promise<boolean | undefined> => {
  const { getBattery }: NavigatorWithBattery = navigator as NavigatorWithBattery;

  if (!getBattery) {
    return undefined;
  }

  try {
    const battery: BatteryStatus = await getBattery.call(navigator);

    return !battery.charging;
  } catch {
    return undefined;
  }
};
