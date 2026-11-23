import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AppRoute } from '.';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ConsoleOpenChanged } from '../../utils/states/panel.layout.state';
import { selectIsFrameSettingsOpen } from '../../utils/states/ui.workbench.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { setMatchMediaMatches } from '../../utils/test.support/match.media.mock';

const HELP_LABEL = 'Help';
const START_LABEL = 'Start job';
const START_CAPTION = 'Start';
const SHOW_FRAME_SETTINGS_LABEL = 'Show frame settings';
const HIDE_FRAME_SETTINGS_LABEL = 'Hide frame settings';
const HIDDEN_REGION_SELECTOR = '[class*="hiddenRegion"]';
const STICKY_STOP_BAR_SELECTOR = '[class*="stickyStopBar"]';

const renderWorkbench = async (store: AppStore): Promise<void> => {
  render(<Provider store={store}><AntdTestProvider><AppRoute /></AntdTestProvider></Provider>);
  await screen.findByRole('main');
};

describe(`${AppRoute.name} in a narrow window`, () => {
  it('pins one Start beside Stop, and it keeps its guard while no laser is connected', async () => {
    setMatchMediaMatches(false);
    await renderWorkbench(newStore());

    const stickyStopBar: HTMLElement | null = document.querySelector(STICKY_STOP_BAR_SELECTOR);

    // A text query counts the Start buttons across the whole workbench cheaply; a role query over all of it, hidden
    // regions included, takes many seconds, so the button's own checks run inside the stop bar.
    expect(screen.getAllByText(START_CAPTION)).toHaveLength(1);
    expect(stickyStopBar).not.toBeNull();
    expect(within(stickyStopBar ?? document.body).getByRole('button', { name: START_LABEL }))
      .toHaveAttribute('aria-disabled', 'true');
  });

  it('shows only the chosen region and keeps the others mounted', async () => {
    setMatchMediaMatches(false);
    await renderWorkbench(newStore());

    const bedRegion: HTMLElement | null = screen.getByRole('main').parentElement;

    expect(bedRegion?.className).not.toContain('hiddenRegion');

    fireEvent.click(screen.getByRole('radio', { name: 'Job' }));

    expect(bedRegion?.className).toContain('hiddenRegion');
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('ends the regions above the console sheet while it is open, so the bed re-fits to the space left', async () => {
    const store: AppStore = newStore();

    setMatchMediaMatches(false);
    await renderWorkbench(store);

    const regionsBox: HTMLElement | null | undefined = screen.getByRole('main').parentElement?.parentElement;

    expect(regionsBox?.className).not.toContain('narrowRegionsWithSheet');

    act(() => {
      store.dispatch(new ConsoleOpenChanged({ isConsoleOpen: true }));
    });

    expect(regionsBox?.className).toContain('narrowRegionsWithSheet');

    act(() => {
      store.dispatch(new ConsoleOpenChanged({ isConsoleOpen: false }));
    });

    expect(regionsBox?.className).not.toContain('narrowRegionsWithSheet');
  });

  it('keeps open frame settings when the window crosses the breakpoint', async () => {
    const store: AppStore = newStore();

    setMatchMediaMatches(true);
    await renderWorkbench(store);
    // jsdom's getComputedStyle matches every antd rule (about a thousand) on each call, and a default role query or
    // toBeVisible calls it for every ancestor of every candidate, which took seconds over the whole app. So the
    // query skips that walk (`hidden: true`) and the test checks the app's own region hiding instead.
    const showButton: HTMLElement = screen.getByRole('button', { name: SHOW_FRAME_SETTINGS_LABEL, hidden: true });

    expect(showButton.closest(HIDDEN_REGION_SELECTOR)).toBeNull();
    fireEvent.click(showButton);

    act(() => {
      setMatchMediaMatches(false);
    });

    expect(selectIsFrameSettingsOpen(store.getState())).toBe(true);
    // The Job region is hidden in the narrow layout; the open settings stay mounted there for when it is shown.
    expect(screen.getByRole('button', { name: HIDE_FRAME_SETTINGS_LABEL, hidden: true })).toBeInTheDocument();
  });

  it('keeps the Help button in the top bar', async () => {
    setMatchMediaMatches(false);
    await renderWorkbench(newStore());

    expect(screen.getByRole('button', { name: HELP_LABEL, hidden: true })).toBeInTheDocument();
  });
});
