/* eslint-disable */
/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * Add or change translations in the CSV files under tools/localization,
 * then run:
 *
 *   npm run locales:update
 *
 * Any manual edit here is overwritten by the next generator run, and CI
 * fails the build when this file does not match the CSV sources.
 */
import { registerLocales } from './localization';

// #region DEFAULT
export const DEFAULT = {
  APP_TAGLINE: 'APP_TAGLINE',
  APP_TITLE: 'APP_TITLE',
  APP_UPDATE_DISMISS: 'APP_UPDATE_DISMISS',
  APP_UPDATE_NEED_REFRESH: 'APP_UPDATE_NEED_REFRESH',
  APP_UPDATE_OFFLINE_READY: 'APP_UPDATE_OFFLINE_READY',
  APP_UPDATE_RELOAD: 'APP_UPDATE_RELOAD',
  BROWSER_STATUS_OFFLINE: 'BROWSER_STATUS_OFFLINE',
  BROWSER_STATUS_ONLINE: 'BROWSER_STATUS_ONLINE',
  BROWSER_STATUS_WEB_SERIAL_SUPPORTED: 'BROWSER_STATUS_WEB_SERIAL_SUPPORTED',
  BROWSER_STATUS_WEB_SERIAL_UNSUPPORTED: 'BROWSER_STATUS_WEB_SERIAL_UNSUPPORTED',
} as const;

export type DefaultLocaleKey = (typeof DEFAULT)[keyof typeof DEFAULT];

registerLocales({
  en: {
    code: 'en',
    translation: {
      [DEFAULT.APP_TAGLINE]: "GRBL laser control in your browser - works offline.",
      [DEFAULT.APP_TITLE]: "webgrbl",
      [DEFAULT.APP_UPDATE_DISMISS]: "Dismiss",
      [DEFAULT.APP_UPDATE_NEED_REFRESH]: "A new version of webgrbl is available.",
      [DEFAULT.APP_UPDATE_OFFLINE_READY]: "webgrbl is ready to work offline.",
      [DEFAULT.APP_UPDATE_RELOAD]: "Reload",
      [DEFAULT.BROWSER_STATUS_OFFLINE]: "Offline",
      [DEFAULT.BROWSER_STATUS_ONLINE]: "Online",
      [DEFAULT.BROWSER_STATUS_WEB_SERIAL_SUPPORTED]: "Web Serial ready",
      [DEFAULT.BROWSER_STATUS_WEB_SERIAL_UNSUPPORTED]: "Web Serial unavailable - use Chrome or Edge on desktop",
    },
  },
});
// #endregion

export const LOCALE_GROUPS = {
  DEFAULT,
} as const;

export type LocaleKey = DefaultLocaleKey;
/* eslint-enable */
