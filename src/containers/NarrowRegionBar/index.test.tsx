import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { NarrowRegionBar } from '.';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ConsoleOpenChanged, selectIsConsoleOpen } from '../../utils/states/panel.layout.state';
import { selectNarrowRegion } from '../../utils/states/ui.workbench.state';
import { WORKBENCH_REGION } from '../../utils/states/workbench.region.constants';

describe(NarrowRegionBar.name, () => {
  it('starts on the bed and changes the shown region', () => {
    const store: AppStore = newStore();

    render(<Provider store={store}><NarrowRegionBar /></Provider>);

    expect(screen.getByRole('radio', { name: 'Bed' })).toBeChecked();

    fireEvent.click(screen.getByRole('radio', { name: 'Job' }));

    expect(selectNarrowRegion(store.getState())).toBe(WORKBENCH_REGION.JOB);
  });

  it('puts the console sheet away when another region is chosen', () => {
    const store: AppStore = newStore();

    store.dispatch(new ConsoleOpenChanged({ isConsoleOpen: true }));
    render(<Provider store={store}><NarrowRegionBar /></Provider>);
    fireEvent.click(screen.getByRole('radio', { name: 'Job' }));

    expect(selectIsConsoleOpen(store.getState())).toBe(false);
  });
});
