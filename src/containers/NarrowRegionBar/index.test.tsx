import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { NarrowRegionBar } from '.';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
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
});
