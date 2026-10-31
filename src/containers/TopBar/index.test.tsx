import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { TopBar } from '.';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

const COMING_SOON_CONTROL_LABELS: readonly string[] = [
  'Project',
  'Import SVG',
  'Materials',
  'Machine profiles',
  'Undo',
  'Redo',
];
const APP_TITLE = 'webgrbl';
const AUTOSAVE_TEXT = 'Autosave: off';
const DISCONNECTED_PATTERN = /Disconnected/;
const FIXED_HEIGHT_CLASS_NAME = 'fixedHeightBar';

describe(TopBar.name, () => {
  it('shows the app name, the autosave readout and the connection pill', () => {
    render(
      <Provider store={newStore()}>
        <TopBar />
      </Provider>,
    );

    expect(screen.getByRole('heading', { name: APP_TITLE })).toBeInTheDocument();
    expect(screen.getByText(AUTOSAVE_TEXT)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: DISCONNECTED_PATTERN })).toBeInTheDocument();
  });

  it.each(COMING_SOON_CONTROL_LABELS)('clicking the coming-soon control %s dispatches nothing', (label: string) => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <TopBar />
      </Provider>,
    );
    fireEvent.click(screen.getByRole('button', { name: label, hidden: true }));

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('keeps a fixed height on one row', () => {
    render(
      <Provider store={newStore()}>
        <TopBar />
      </Provider>,
    );

    expect(screen.getByRole('banner').className).toContain(FIXED_HEIGHT_CLASS_NAME);
  });
});
