import { fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AppRoute } from '.';
import { PANEL_SIZES_REPOSITORY } from '../../utils/project/panel.sizes.repository';
import { setMatchMediaMatches } from '../../utils/test.support/match.media.mock';
import { newStore } from '../../utils/states/new.store';

const APP_TITLE = 'webgrbl';
const CONNECTION_PILL_PATTERN = /^Connection: Not connected/;
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
// At the 1024 px jsdom window the side panels open at 307.2 px and 358.4 px, the bed takes the rest.
const STORED_PERCENTS: number[] = [30, 35, 35];
const STORED_FLEX_BASES: readonly string[] = ['307.2px', 'auto', '358.4px'];
const STORED_CONSOLE_PERCENT = 40;
const CONSOLE_INPUT_LABEL = 'Console command';
const VERTICAL_SPLITTER_SELECTOR = '.ant-splitter-vertical';
const HORIZONTAL_SPLITTER_SELECTOR = '.ant-splitter-horizontal';

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

/** The panels of the outer splitter only, not the bed column splitter nested in its middle panel. */
const getSplitterPanels = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>(`${HORIZONTAL_SPLITTER_SELECTOR} > ${SPLITTER_PANEL_SELECTOR}`));

const getBedColumnPanels = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>(`${VERTICAL_SPLITTER_SELECTOR} > ${SPLITTER_PANEL_SELECTOR}`));

const toggleConsole = (): void => {
  fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('switch', { name: CONSOLE_TOGGLE_LABEL }));
};

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

  it('keeps the connection pill in the top bar', () => {
    renderAppRoute();

    expect(within(getTopBar()).getByRole('button', { name: CONNECTION_PILL_PATTERN })).toBeInTheDocument();
  });

  it('opens the console as a panel below the bed in a wide window, keeping the bed', async () => {
    renderAppRoute();
    await waitForRegions();

    expect(getBedColumnPanels()).toHaveLength(1);

    toggleConsole();

    const [bedColumnPanel, consoleColumnPanel] = getBedColumnPanels();

    expect(bedColumnPanel).toContainElement(screen.getByRole('main'));
    expect(consoleColumnPanel).toContainElement(screen.getByRole('heading', { name: CONSOLE_TITLE }));
    expect(screen.getByRole('contentinfo')).not.toContainElement(screen.getByLabelText(CONSOLE_INPUT_LABEL));
  });

  it('closes the console panel again and leaves the bed in place', async () => {
    renderAppRoute();
    await waitForRegions();
    const bedRegion: HTMLElement = screen.getByRole('main');

    toggleConsole();
    toggleConsole();

    expect(getBedColumnPanels()).toHaveLength(1);
    expect(screen.queryByLabelText(CONSOLE_INPUT_LABEL)).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toBe(bedRegion);
  });

  it('opens the console with its stored height', async () => {
    await PANEL_SIZES_REPOSITORY.setConsoleSizePercent(STORED_CONSOLE_PERCENT);
    renderAppRoute();
    await waitForRegions();

    toggleConsole();

    expect(getBedColumnPanels()[1]?.style.flexBasis).toBe('40%');
  });

  it('opens the console with the default height when none is stored', async () => {
    renderAppRoute();
    await waitForRegions();

    toggleConsole();

    expect(getBedColumnPanels()[1]?.style.flexBasis).toBe('30%');
  });

  it('stacks the open console below the bed in a narrow window', () => {
    setMatchMediaMatches(false);
    renderAppRoute();

    toggleConsole();

    const consoleHeading: HTMLElement = screen.getByRole('heading', { name: CONSOLE_TITLE });

    expect(document.querySelector(SPLITTER_SELECTOR)).not.toBeInTheDocument();
    expect(screen.getByRole('main').compareDocumentPosition(consoleHeading))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('puts the bed first in a narrow window, so the first screen shows the work', () => {
    setMatchMediaMatches(false);
    renderAppRoute();

    const bedRegion: HTMLElement = screen.getByRole('main');
    const designRegion: HTMLElement = screen.getByRole('complementary', { name: DESIGN_PANEL_LABEL });

    expect(bedRegion.compareDocumentPosition(designRegion)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
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
    expect(screen.getByRole('main').closest(HORIZONTAL_SPLITTER_SELECTOR)?.parentElement)
      .toHaveClass(LAYOUT_CLASS_NAME);
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

  it('opens the side panels at their stored share of the window width, the bed taking the rest', async () => {
    await PANEL_SIZES_REPOSITORY.setPanelSizePercents(STORED_PERCENTS);
    renderAppRoute();
    await waitForRegions();

    expect(getSplitterPanelFlexBases()).toEqual(STORED_FLEX_BASES);
  });

  it('opens the splitter with the fixed side panel widths when no sizes are stored', async () => {
    renderAppRoute();
    await waitForRegions();

    expect(getSplitterPanelFlexBases()).toEqual(['328px', 'auto', '352px']);
  });

  it('shows no panels in a wide window until the stored sizes are read, so they never jump', async () => {
    await PANEL_SIZES_REPOSITORY.setPanelSizePercents(STORED_PERCENTS);
    renderAppRoute();

    expect(screen.queryByRole('main')).not.toBeInTheDocument();

    await waitForRegions();

    expect(getSplitterPanelFlexBases()).toEqual(STORED_FLEX_BASES);
  });
});
