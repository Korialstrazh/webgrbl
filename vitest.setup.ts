import '@testing-library/jest-dom/vitest';

// The PWA plugin's virtual module only exists inside a Vite build, so tests get a service worker that never updates.
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [false, () => undefined],
    offlineReady: [false, () => undefined],
    updateServiceWorker: async () => undefined,
  }),
}));
