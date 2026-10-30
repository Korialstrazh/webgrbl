import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserStatusBar } from '.';
import { newStore } from '../../utils/states/new.store';

const OFFLINE_EVENT_NAME = 'offline';
const OFFLINE_LABEL = 'Offline';
const WEB_SERIAL_UNAVAILABLE_PATTERN = /Web Serial unavailable/;

const renderBrowserStatusBar = (): void => {
  render(
    <Provider store={newStore()}>
      <BrowserStatusBar />
    </Provider>,
  );
};

describe(BrowserStatusBar.name, () => {
  it('switches to offline when the browser loses its connection', () => {
    renderBrowserStatusBar();

    act(() => {
      window.dispatchEvent(new Event(OFFLINE_EVENT_NAME));
    });

    expect(screen.getByText(OFFLINE_LABEL)).toBeInTheDocument();
  });

  it('explains that Web Serial is missing in a browser without navigator.serial', () => {
    renderBrowserStatusBar();

    expect(screen.getByText(WEB_SERIAL_UNAVAILABLE_PATTERN)).toBeInTheDocument();
  });
});
