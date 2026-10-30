/**
 * Frontend entry point. Builds the store and mounts the application root into the page.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
// Must stay above the app imports: registers every translation bundle before any module calls t().
import './utils/localization/default.locales';
import { AppRoute } from './routes/AppRoute';
import { newStore } from './utils/states/new.store';
import type { AppStore } from './utils/states/new.store';
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
      <AppRoute />
    </Provider>
  </StrictMode>,
);
