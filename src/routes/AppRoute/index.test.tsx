import { fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AppRoute } from '.';
import { DESIGN_COLUMN_WIDTH_PROPERTY, MACHINE_COLUMN_WIDTH_PROPERTY } from '../../utils/layout.constants';
import { PANEL_SIZES_REPOSITORY } from '../../utils/project/panel.sizes.repository';
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
const SPLITTER_SELECTOR = '.ant-splitter';
const SPLITTER_PANEL_SELECTOR = '.ant-splitter-panel';
const STORED_PERCENTS: number[] = [20, 50, 30];

const renderAppRoute = (): HTMLElement => {
  const { container } = render(
    <Provider store={newStore()}>
      <AppRoute />
    </Provider>,
  );

  return container.firstElementChild as HTMLElement;
};

/** In a wide window the regions wait for the stored panel sizes, which IndexedDB reads asynchronously. */
const waitForRegions = async (): Promise<void> => {
  await screen.findByRole('main');
};

const getSplitterPanels = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>(SPLITTER_PANEL_SELECTOR));

const getSplitterPanelFlexBases = (): string[] =>
  getSplitterPanels().map((splitterPanel: HTMLElement): string => splitterPanel.style.flexBasis);

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

  it('renders all five regions', async () => {
    renderAppRoute();
    await waitForRegions();

    expect(getTopBar()).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: DESIGN_PANEL_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: MACHINE_PANEL_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('keeps the connection pill and the console working inside their regions', () => {
    renderAppRoute();
    fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('switch', { name: CONSOLE_TOGGLE_LABEL }));

    expect(within(getTopBar()).getByRole('button', { name: CONNECTION_PILL_PATTERN })).toBeInTheDocument();
    expect(within(screen.getByRole('contentinfo')).getByRole('heading', { name: CONSOLE_TITLE })).toBeInTheDocument();
  });

  it('wide layout renders exactly one STOP, in the machine panel', async () => {
    renderAppRoute();
    await waitForRegions();

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

  it('crossing the breakpoint keeps exactly one STOP', async () => {
    renderAppRoute();
    await waitForRegions();

    setMatchMediaMatches(false);
    expect(getStopButtons()).toHaveLength(ONLY_STOP_COUNT);

    setMatchMediaMatches(true);
    expect(getStopButtons()).toHaveLength(ONLY_STOP_COUNT);
  });

  it('builds the workbench from antd Layout landmarks', async () => {
    renderAppRoute();
    await waitForRegions();

    expect(getTopBar()).toHaveClass(HEADER_CLASS_NAME);
    expect(screen.getByRole('complementary', { name: DESIGN_PANEL_LABEL })).toHaveClass(SIDER_CLASS_NAME);
    expect(screen.getByRole('main')).toHaveClass(CONTENT_CLASS_NAME);
    expect(screen.getByRole('complementary', { name: MACHINE_PANEL_LABEL })).toHaveClass(SIDER_CLASS_NAME);
    expect(screen.getByRole('contentinfo')).toHaveClass(FOOTER_CLASS_NAME);
    expect(screen.getByRole('main').closest(SPLITTER_SELECTOR)?.parentElement).toHaveClass(LAYOUT_CLASS_NAME);
  });

  it('fits the root layout to the window so only the inner regions scroll', () => {
    const rootElement: HTMLElement = renderAppRoute();

    expect(rootElement).toHaveClass(LAYOUT_CLASS_NAME);
    expect(rootElement.className).toContain(ROOT_CLASS_NAME);
    expect(rootElement).toContainElement(getTopBar());
    expect(rootElement).toContainElement(screen.getByRole('contentinfo'));
  });

  it('places the panels in a resizable splitter only in the wide layout', async () => {
    renderAppRoute();
    await waitForRegions();

    const splitterPanels: HTMLElement[] = getSplitterPanels();

    expect(splitterPanels).toHaveLength(STORED_PERCENTS.length);
    expect(splitterPanels[0]).toContainElement(screen.getByRole('complementary', { name: DESIGN_PANEL_LABEL }));
    expect(splitterPanels[1]).toContainElement(screen.getByRole('main'));
    expect(splitterPanels[2]).toContainElement(screen.getByRole('complementary', { name: MACHINE_PANEL_LABEL }));

    setMatchMediaMatches(false);

    expect(document.querySelector(SPLITTER_SELECTOR)).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('opens the splitter with the stored panel sizes', async () => {
    await PANEL_SIZES_REPOSITORY.setPanelSizePercents(STORED_PERCENTS);
    renderAppRoute();
    await waitForRegions();

    expect(getSplitterPanelFlexBases()).toEqual(['20%', '50%', '30%']);
  });

  it('opens the splitter with the fixed side panel widths when no sizes are stored', async () => {
    renderAppRoute();
    await waitForRegions();

    expect(getSplitterPanelFlexBases()).toEqual(['280px', 'auto', '352px']);
  });

  it('shows no panels in a wide window until the stored sizes are read, so they never jump', async () => {
    await PANEL_SIZES_REPOSITORY.setPanelSizePercents(STORED_PERCENTS);
    renderAppRoute();

    expect(screen.queryByRole('main')).not.toBeInTheDocument();

    await waitForRegions();

    expect(getSplitterPanelFlexBases()).toEqual(['20%', '50%', '30%']);
  });

  it('lines the console overlay up with the stored column widths', async () => {
    await PANEL_SIZES_REPOSITORY.setPanelSizePercents(STORED_PERCENTS);
    const rootElement: HTMLElement = renderAppRoute();
    await waitForRegions();

    expect(rootElement.style.getPropertyValue(DESIGN_COLUMN_WIDTH_PROPERTY)).toBe('20%');
    expect(rootElement.style.getPropertyValue(MACHINE_COLUMN_WIDTH_PROPERTY)).toBe('30%');
  });
});
