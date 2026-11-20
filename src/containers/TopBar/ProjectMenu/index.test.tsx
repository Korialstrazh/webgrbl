import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { ProjectMenu } from '.';
import { newStore } from '../../../utils/states/new.store';
import type { AppStore } from '../../../utils/states/new.store';
import { OVERLAY_KIND } from '../../../utils/states/overlay.kind.constants';
import { OverlayOpened } from '../../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../../utils/test.support/antd.test.provider';
import { TOP_BAR_IMPORT_SVG_BUTTON_ID } from './project.menu.constants';

const PROJECT_MENU_LABEL = 'Project';
const NEW_PROJECT_LABEL = 'New project';
const DIALOG_OVERLAY_ID = 'test-dialog';
const HIDDEN_DROPDOWN_SELECTOR = '.ant-dropdown-hidden';
const IMPORT_SVG_LABEL = 'Import SVG';

describe(ProjectMenu.name, () => {
  it('closes the open menu when a dialog opens', async () => {
    const store: AppStore = newStore();
    render(
      <Provider store={store}>
        <AntdTestProvider>
          <ProjectMenu />
        </AntdTestProvider>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: PROJECT_MENU_LABEL }));

    expect(await screen.findByText(NEW_PROJECT_LABEL)).toBeInTheDocument();
    expect(document.querySelector(HIDDEN_DROPDOWN_SELECTOR)).not.toBeInTheDocument();

    act(() => {
      store.dispatch(new OverlayOpened({ overlayId: DIALOG_OVERLAY_ID, overlayKind: OVERLAY_KIND.DIALOG }));
    });

    await vi.waitFor((): void => {
      expect(document.querySelector(HIDDEN_DROPDOWN_SELECTOR)).toBeInTheDocument();
    });
  });

  it('opens the top bar SVG picker from its Import SVG entry, used on a phone', async () => {
    const importButton: HTMLButtonElement = document.createElement('button');
    const importClickSpy = vi.fn();
    importButton.id = TOP_BAR_IMPORT_SVG_BUTTON_ID;
    importButton.addEventListener('click', importClickSpy);
    document.body.append(importButton);
    render(
      <Provider store={newStore()}>
        <AntdTestProvider>
          <ProjectMenu />
        </AntdTestProvider>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: PROJECT_MENU_LABEL }));
    fireEvent.click(await screen.findByText(IMPORT_SVG_LABEL));

    expect(importClickSpy).toHaveBeenCalledTimes(1);
    importButton.remove();
  });
});
