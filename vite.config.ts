/**
 * Vite and Vitest configuration. The PWA plugin precaches the whole app shell so the controller UI keeps working
 * offline in the workshop; updates wait for the user's confirmation because reloading mid-job would stop the laser
 * stream.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { configDefaults } from 'vitest/config';
import packageManifest from './package.json' with { type: 'json' };

const APP_NAME = 'webgrbl';
const APP_DESCRIPTION = 'Control a GRBL laser cutter or engraver straight from the browser.';
const THEME_COLOR = '#121417';
const ICON_PATH = 'favicon.svg';
// antd dialog tests can take longer than vitest's default 5 s on a heavily loaded machine.
const TEST_TIMEOUT_MS = 15_000;
// antd and the packages it is built from go into chunks of their own, so the app chunk stays small and caches apart.
// The components and their building blocks (styling engine and icons, rc components) are split so each chunk stays
// under the size limit.
const ANTD_CHUNK_NAME = 'antd';
const ANTD_MODULE_PATTERN = /[\\/]node_modules[\\/]antd[\\/]/;
const ANTD_BASE_CHUNK_NAME = 'antd-base';
const ANTD_BASE_MODULE_PATTERN = /[\\/]node_modules[\\/]@ant-design[\\/]/;
const ANTD_RC_CHUNK_NAME = 'antd-rc';
const ANTD_RC_MODULE_PATTERN = /[\\/]node_modules[\\/]@rc-component[\\/]/;
// A group also takes in the modules its matches import, so the building blocks must claim theirs first: @ant-design,
// then @rc-component, then antd itself.
const ANTD_BASE_CHUNK_PRIORITY = 30;
const ANTD_RC_CHUNK_PRIORITY = 20;
const ANTD_CHUNK_PRIORITY = 10;

export default defineConfig({
  // The app version is read from package.json once, at build time, and written into the code as a text constant.
  define: {
    __APP_VERSION__: JSON.stringify(packageManifest.version),
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: ANTD_BASE_CHUNK_NAME, test: ANTD_BASE_MODULE_PATTERN, priority: ANTD_BASE_CHUNK_PRIORITY },
            { name: ANTD_RC_CHUNK_NAME, test: ANTD_RC_MODULE_PATTERN, priority: ANTD_RC_CHUNK_PRIORITY },
            { name: ANTD_CHUNK_NAME, test: ANTD_MODULE_PATTERN, priority: ANTD_CHUNK_PRIORITY },
          ],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [ICON_PATH],
      manifest: {
        name: APP_NAME,
        short_name: APP_NAME,
        description: APP_DESCRIPTION,
        theme_color: THEME_COLOR,
        background_color: THEME_COLOR,
        display: 'standalone',
        icons: [{ src: ICON_PATH, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, '.claude/worktrees/**', '.worktrees/**'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: TEST_TIMEOUT_MS,
  },
});
