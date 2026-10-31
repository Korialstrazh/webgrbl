import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AppRoute } from '.';
import { newStore } from '../../utils/states/new.store';

const APP_TITLE = 'webgrbl';
const CONNECT_LABEL = 'Connect';
const STOP_LABEL = 'Stop';
const CONSOLE_TITLE = 'Console';

describe(AppRoute.name, () => {
  it('shows the app title as the page heading', () => {
    render(
      <Provider store={newStore()}>
        <AppRoute />
      </Provider>,
    );

    expect(screen.getByRole('heading', { name: APP_TITLE })).toBeInTheDocument();
  });

  it('composes the connection controls, machine controls and console', () => {
    render(
      <Provider store={newStore()}>
        <AppRoute />
      </Provider>,
    );

    expect(screen.getByRole('button', { name: CONNECT_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STOP_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: CONSOLE_TITLE })).toBeInTheDocument();
  });
});
