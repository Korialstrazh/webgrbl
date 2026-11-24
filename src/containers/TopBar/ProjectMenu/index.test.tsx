import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { ProjectMenu } from '.';
import { newStore } from '../../../utils/states/new.store';
import type { AppStore } from '../../../utils/states/new.store';
import { OVERLAY_KIND } from '../../../utils/states/overlay.kind.constants';
import { OverlayOpened } from '../../../utils/states/ui.overlay.state';
import { selectIsMachineProfilesDialogOpen } from '../../../utils/states/ui.workbench.state';
import { AntdTestProvider } from '../../../utils/test.support/antd.test.provider';
import { APP_VERSION } from '../../../utils/app.version.constants';
import { TOP_BAR_IMPORT_SVG_BUTTON_ID } from './project.menu.constants';

const PROJECT_MENU_LABEL = 'Project';
const NEW_PROJECT_LABEL = 'New project';
const DIALOG_OVERLAY_ID = 'test-dialog';
const HIDDEN_DROPDOWN_SELECTOR = '.ant-dropdown-hidden';
const IMPORT_SVG_LABEL = 'Import SVG';
const MACHINE_PROFILES_LABEL = 'Laser profiles';
const EXPORT_GCODE_LABEL = 'Export G-code';
const REDO_LABEL = 'Redo';
const VERSION_FOOTER_TEXT = `webgrbl v${APP_VERSION}`;
const FOLDER_ICON_SELECTOR = '.anticon-folder';
const MENU_ICON_SELECTOR = '.anticon-menu';

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

  it('opens the laser profiles dialog from its phone-only entry', async () => {
    const store: AppStore = newStore();
    render(
      <Provider store={store}>
        <AntdTestProvider>
          <ProjectMenu />
        </AntdTestProvider>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: PROJECT_MENU_LABEL }));
    fireEvent.click(await screen.findByText(MACHINE_PROFILES_LABEL));

    expect(selectIsMachineProfilesDialogOpen(store.getState())).toBe(true);
  });

  it('names the app version in a footer line that is not a menu entry, for the phone heading without it', async () => {
    render(
      <Provider store={newStore()}>
        <AntdTestProvider>
          <ProjectMenu />
        </AntdTestProvider>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: PROJECT_MENU_LABEL }));

    const versionFooter: HTMLElement = await screen.findByText(VERSION_FOOTER_TEXT);

    expect(versionFooter.closest('[role="menuitem"]')).not.toBeInTheDocument();
  });

  it('lists the phone entries after Export G-code as Import SVG, laser profiles, then Redo', async () => {
    render(
      <Provider store={newStore()}>
        <AntdTestProvider>
          <ProjectMenu />
        </AntdTestProvider>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: PROJECT_MENU_LABEL }));
    await screen.findByText(IMPORT_SVG_LABEL);

    const entryTexts: string[] = screen.getAllByRole('menuitem').map((entry: HTMLElement) => entry.textContent ?? '');
    const exportIndex: number = entryTexts.findIndex((text: string) => text.includes(EXPORT_GCODE_LABEL));
    const importIndex: number = entryTexts.findIndex((text: string) => text.includes(IMPORT_SVG_LABEL));
    const profilesIndex: number = entryTexts.findIndex((text: string) => text.includes(MACHINE_PROFILES_LABEL));
    const redoIndex: number = entryTexts.findIndex((text: string) => text.includes(REDO_LABEL));

    expect(exportIndex).toBeGreaterThanOrEqual(0);
    expect(importIndex).toBeGreaterThan(exportIndex);
    expect(profilesIndex).toBeGreaterThan(importIndex);
    expect(redoIndex).toBeGreaterThan(profilesIndex);
  });

  it('carries both the folder and the phone hamburger icon on its trigger, under the one Project name', () => {
    render(
      <Provider store={newStore()}>
        <AntdTestProvider>
          <ProjectMenu />
        </AntdTestProvider>
      </Provider>,
    );

    const trigger: HTMLElement = screen.getByRole('button', { name: PROJECT_MENU_LABEL });

    expect(trigger.querySelector(FOLDER_ICON_SELECTOR)).toBeInTheDocument();
    expect(trigger.querySelector(MENU_ICON_SELECTOR)).toBeInTheDocument();
  });
});
