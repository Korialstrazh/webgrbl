import { act, fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BED_VIEW_MODE } from '../../utils/bed/bed.view.constants';
import { dismissHoverTooltips } from '../../utils/browser/dismiss.hover.tooltips';
import { BedViewModeChanged } from '../../utils/states/bed.view.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { TooltipDismissal } from '.';

vi.mock('../../utils/browser/dismiss.hover.tooltips', () => ({ dismissHoverTooltips: vi.fn() }));

const renderDismissal = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <TooltipDismissal />
    </Provider>,
  );
  vi.mocked(dismissHoverTooltips).mockClear();
};

describe(TooltipDismissal.name, () => {
  it.each(['resize', 'blur'])('closes the hover tooltips on a window %s', (eventName: string) => {
    renderDismissal(newStore());

    fireEvent(window, new Event(eventName));

    expect(dismissHoverTooltips).toHaveBeenCalledTimes(1);
  });

  it('closes the hover tooltips when the bed view changes', () => {
    const store: AppStore = newStore();

    renderDismissal(store);
    act(() => {
      store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.THREE_D }));
    });

    expect(dismissHoverTooltips).toHaveBeenCalledTimes(1);
  });
});
