import '@testing-library/jest-dom/vitest';
import { FALLBACK_LANGUAGE } from './src/utils/localization/constants';
import './src/utils/localization/default.locales';
import { i18n } from './src/utils/localization/localization';
import { installMatchMediaMock, resetMatchMediaMock } from './src/utils/test.support/match.media.mock';
import { installResizeObserverMock } from './src/utils/test.support/resize.observer.mock';
import { installSvgScreenMatrixMock } from './src/utils/test.support/svg.screen.matrix.mock';

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

// jsdom has no matchMedia, so every test gets one that starts narrow and forgets its listeners afterwards.
installMatchMediaMock();
beforeEach(resetMatchMediaMock);

// jsdom has no ResizeObserver, and antd needs one to place popovers.
installResizeObserverMock();

// jsdom has no getScreenCTM, so every SVG reports no matrix, like one that is not on screen, until a test sets one.
installSvgScreenMatrixMock();

// jsdom keeps localStorage for the whole test file, and stores persist what sagas write, so every test starts empty.
afterEach(() => {
  localStorage.clear();
});
