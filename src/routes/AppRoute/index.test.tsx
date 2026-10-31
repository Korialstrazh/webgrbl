import { fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AppRoute } from '.';
import { setMatchMediaMatches } from '../../utils/test.support/match.media.mock';
import { newStore } from '../../utils/states/new.store';

const APP_TITLE = 'webgrbl';
const CONNECTION_PILL_PATTERN = /Disconnected/;
const STOP_LABEL = 'Stop';
const CONSOLE_TITLE = 'Console';
const CONSOLE_TOGGLE_LABEL = 'Console';
const DESIGN_PANEL_LABEL = 'Design';
const MACHINE_PANEL_LABEL = 'Machine';
const ONLY_STOP_COUNT = 1;
const ROOT_CLASS_NAME = 'appRoute';
const LAYOUT_CLASS_NAME = 'ant-layout';
const HEADER_CLASS_NAME = 'ant-layout-header';
const SIDER_CLASS_NAME = 'ant-layout-sider';
const CONTENT_CLASS_NAME = 'ant-layout-content';
const FOOTER_CLASS_NAME = 'ant-layout-footer';
const HAS_SIDER_CLASS_NAME = 'ant-layout-has-sider';

const renderAppRoute = (): HTMLElement => {
  const { container } = render(
    <Provider store={newStore()}>
      <AppRoute />
    </Provider>,
  );

  return container.firstElementChild as HTMLElement;
};

const getRegionsLayout = (): HTMLElement => screen.getByRole('main').parentElement as HTMLElement;

// Testing Library counts every header as a banner, including the one inside the console section.
const getTopBar = (): HTMLElement =>
  screen.getByRole('heading', { level: 1, name: APP_TITLE }).closest('header') as HTMLElement;

const getStopButtons = (): HTMLElement[] => screen.getAllByRole('button', { name: STOP_LABEL });

describe(AppRoute.name, () => {
  beforeEach(() => {
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

  it('keeps the connection pill and the console working inside their regions', () => {
    renderAppRoute();
    fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('checkbox', { name: CONSOLE_TOGGLE_LABEL }));

    expect(within(getTopBar()).getByRole('button', { name: CONNECTION_PILL_PATTERN })).toBeInTheDocument();
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

  it('builds the workbench from antd Layout landmarks', () => {
    renderAppRoute();

    expect(getTopBar()).toHaveClass(HEADER_CLASS_NAME);
    expect(screen.getByRole('complementary', { name: DESIGN_PANEL_LABEL })).toHaveClass(SIDER_CLASS_NAME);
    expect(screen.getByRole('main')).toHaveClass(CONTENT_CLASS_NAME);
    expect(screen.getByRole('complementary', { name: MACHINE_PANEL_LABEL })).toHaveClass(SIDER_CLASS_NAME);
    expect(screen.getByRole('contentinfo')).toHaveClass(FOOTER_CLASS_NAME);
    expect(getRegionsLayout()).toHaveClass(LAYOUT_CLASS_NAME);
  });

  it('fits the root layout to the window so only the inner regions scroll', () => {
    const rootElement: HTMLElement = renderAppRoute();

    expect(rootElement).toHaveClass(LAYOUT_CLASS_NAME);
    expect(rootElement.className).toContain(ROOT_CLASS_NAME);
    expect(rootElement).toContainElement(getTopBar());
    expect(rootElement).toContainElement(screen.getByRole('contentinfo'));
  });

  it('places the panels side by side only in the wide layout', () => {
    renderAppRoute();

    expect(getRegionsLayout()).toHaveClass(HAS_SIDER_CLASS_NAME);

    setMatchMediaMatches(false);
    expect(getRegionsLayout()).not.toHaveClass(HAS_SIDER_CLASS_NAME);
  });
});
