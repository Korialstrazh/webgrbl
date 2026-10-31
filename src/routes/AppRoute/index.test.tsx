import { render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AppRoute } from '.';
import { installMatchMediaMock, setMatchMediaMatches } from '../../utils/test.support/match.media.mock';
import { newStore } from '../../utils/states/new.store';

const APP_TITLE = 'webgrbl';
const CONNECT_LABEL = 'Connect';
const STOP_LABEL = 'Stop';
const CONSOLE_TITLE = 'Console';
const DESIGN_PANEL_LABEL = 'Design';
const MACHINE_PANEL_LABEL = 'Machine';
const ONLY_STOP_COUNT = 1;

const renderAppRoute = (): void => {
  render(
    <Provider store={newStore()}>
      <AppRoute />
    </Provider>,
  );
};

// Testing Library counts every header as a banner, including the one inside the console section.
const getTopBar = (): HTMLElement =>
  screen.getByRole('heading', { level: 1, name: APP_TITLE }).closest('header') as HTMLElement;

const getStopButtons = (): HTMLElement[] => screen.getAllByRole('button', { name: STOP_LABEL });

describe(AppRoute.name, () => {
  beforeEach(() => {
    installMatchMediaMock();
    setMatchMediaMatches(true);
  });

  it('shows the app title as the page heading', () => {
    renderAppRoute();

    expect(screen.getByRole('heading', { level: 1, name: APP_TITLE })).toBeInTheDocument();
  });

  it('renders all five regions', () => {
    renderAppRoute();

    expect(getTopBar()).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: DESIGN_PANEL_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: MACHINE_PANEL_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('keeps the connection controls and the console working inside their regions', () => {
    renderAppRoute();

    expect(within(getTopBar()).getByRole('button', { name: CONNECT_LABEL })).toBeInTheDocument();
    expect(within(screen.getByRole('contentinfo')).getByRole('heading', { name: CONSOLE_TITLE })).toBeInTheDocument();
  });

  it('wide layout renders exactly one STOP, in the machine panel', () => {
    renderAppRoute();

    const stopButtons: HTMLElement[] = getStopButtons();
    const [stopButton] = stopButtons;

    expect(stopButtons).toHaveLength(ONLY_STOP_COUNT);
    expect(screen.getByRole('complementary', { name: MACHINE_PANEL_LABEL })).toContainElement(stopButton ?? null);
  });

  it('narrow layout renders exactly one STOP, in the sticky bar', () => {
    setMatchMediaMatches(false);
    renderAppRoute();

    const stopButtons: HTMLElement[] = getStopButtons();
    const [stopButton] = stopButtons;

    expect(stopButtons).toHaveLength(ONLY_STOP_COUNT);
    expect(screen.getByRole('complementary', { name: MACHINE_PANEL_LABEL })).not.toContainElement(stopButton ?? null);
  });

  it('crossing the breakpoint keeps exactly one STOP', () => {
    renderAppRoute();

    setMatchMediaMatches(false);
    expect(getStopButtons()).toHaveLength(ONLY_STOP_COUNT);

    setMatchMediaMatches(true);
    expect(getStopButtons()).toHaveLength(ONLY_STOP_COUNT);
  });
});
