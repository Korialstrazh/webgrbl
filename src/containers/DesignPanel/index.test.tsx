import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { DesignPanel } from '.';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

const DISABLED_REGION_SELECTOR = '[aria-disabled="true"]';
const CONTROL_SELECTOR = 'button, input';
const PANEL_TITLES: readonly string[] = ['Layers', 'Objects', 'Material'];

const renderDesignPanel = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <DesignPanel />
    </Provider>,
  );
};

describe(DesignPanel.name, () => {
  it('shows the layers, objects and material panels as coming soon', () => {
    renderDesignPanel(newStore());

    for (const panelTitle of PANEL_TITLES) {
      expect(screen.getByRole('heading', { name: panelTitle })).toBeInTheDocument();
    }

    expect(document.querySelectorAll(DISABLED_REGION_SELECTOR)).toHaveLength(PANEL_TITLES.length);
  });

  it('every coming-soon control in the design panel dispatches nothing', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderDesignPanel(store);

    for (const disabledRegion of document.querySelectorAll(DISABLED_REGION_SELECTOR)) {
      for (const control of disabledRegion.querySelectorAll(CONTROL_SELECTOR)) {
        fireEvent.click(control);
      }
    }

    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
