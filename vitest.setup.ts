import '@testing-library/jest-dom/vitest';
import { FALLBACK_LANGUAGE } from './src/utils/localization/constants';
import './src/utils/localization/default.locales';
import { i18n } from './src/utils/localization/localization';

// Awaited so the language switch cannot race i18next's own init.
await i18n.changeLanguage(FALLBACK_LANGUAGE);

// The PWA plugin's virtual module only exists inside a Vite build, so tests get a service worker that never updates.
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [false, () => undefined],
    offlineReady: [false, () => undefined],
    updateServiceWorker: async () => undefined,
  }),
}));
