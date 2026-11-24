import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { HelpMenu } from '.';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsAboutOpen, selectIsHandbookOpen } from '../../utils/states/ui.workbench.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const HELP_LABEL = 'Help';
const HANDBOOK_LABEL = 'Getting started';
const ABOUT_LABEL = 'About webgrbl';

const renderHelpMenu = (store: AppStore): void => {
  render(<Provider store={store}><AntdTestProvider><HelpMenu /></AntdTestProvider></Provider>);
};

describe(HelpMenu.name, () => {
  it('lists the handbook and About entries under the Help button', async () => {
    renderHelpMenu(newStore());

    fireEvent.click(screen.getByRole('button', { name: HELP_LABEL }));

    expect(await screen.findByText(HANDBOOK_LABEL)).toBeInTheDocument();
    expect(screen.getByText(ABOUT_LABEL)).toBeInTheDocument();
  });

  it('opens the handbook when Getting started is chosen', async () => {
    const store: AppStore = newStore();
    renderHelpMenu(store);

    fireEvent.click(screen.getByRole('button', { name: HELP_LABEL }));
    fireEvent.click(await screen.findByText(HANDBOOK_LABEL));

    expect(selectIsHandbookOpen(store.getState())).toBe(true);
    expect(selectIsAboutOpen(store.getState())).toBe(false);
  });

  it('opens the About dialog when About webgrbl is chosen', async () => {
    const store: AppStore = newStore();
    renderHelpMenu(store);

    fireEvent.click(screen.getByRole('button', { name: HELP_LABEL }));
    fireEvent.click(await screen.findByText(ABOUT_LABEL));

    expect(selectIsAboutOpen(store.getState())).toBe(true);
    expect(selectIsHandbookOpen(store.getState())).toBe(false);
  });
});
