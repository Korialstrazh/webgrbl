import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AppRoute } from '.';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsFrameSettingsOpen } from '../../utils/states/ui.workbench.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { setMatchMediaMatches } from '../../utils/test.support/match.media.mock';

const START_LABEL = 'Start job';
const SHOW_FRAME_SETTINGS_LABEL = 'Show frame settings';
const HIDE_FRAME_SETTINGS_LABEL = 'Hide frame settings';

const renderWorkbench = async (store: AppStore): Promise<void> => {
  render(<Provider store={store}><AntdTestProvider><AppRoute /></AntdTestProvider></Provider>);
  await screen.findByRole('main');
};

describe('AppRoute in a narrow window', () => {
  it('pins one Start beside Stop, and it keeps its guard while no laser is connected', async () => {
    setMatchMediaMatches(false);
    await renderWorkbench(newStore());

    expect(screen.getAllByRole('button', { name: START_LABEL })).toHaveLength(1);
    expect(screen.getByRole('button', { name: START_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: START_LABEL }).closest('[class*="stickyStopBar"]')).not.toBeNull();
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

  it('keeps open frame settings when the window crosses the breakpoint', async () => {
    const store: AppStore = newStore();

    setMatchMediaMatches(true);
    await renderWorkbench(store);
    fireEvent.click(await screen.findByRole('button', { name: SHOW_FRAME_SETTINGS_LABEL }));

    act(() => {
      setMatchMediaMatches(false);
    });

    expect(selectIsFrameSettingsOpen(store.getState())).toBe(true);
    expect(await screen.findByRole('button', { name: HIDE_FRAME_SETTINGS_LABEL })).toBeInTheDocument();
  });
});
