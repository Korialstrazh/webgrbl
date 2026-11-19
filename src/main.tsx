/**
 * Frontend entry point. Builds the store and mounts the application root, inside the antd theme, into the page.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { App, ConfigProvider } from 'antd';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
// Must stay above the app imports: registers every translation bundle before any module calls t().
import './utils/localization/default.locales';
import { AppRoute } from './routes/AppRoute';
import { newStore } from './utils/states/new.store';
import type { AppStore } from './utils/states/new.store';
import { ANTD_THEME } from './utils/theme/antd.theme';
import './global.styles.scss';

const ROOT_ELEMENT_ID = 'root';

const rootElement: HTMLElement | null = document.getElementById(ROOT_ELEMENT_ID);

if (!rootElement) {
  throw new Error(`Mount element #${ROOT_ELEMENT_ID} is missing from index.html`);
}

const store: AppStore = newStore();

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={ANTD_THEME}>
        <App>
          <AppRoute />
        </App>
      </ConfigProvider>
    </Provider>
  </StrictMode>,
);
