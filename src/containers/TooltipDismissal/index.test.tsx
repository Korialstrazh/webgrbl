import { act, fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BED_VIEW_MODE } from '../../utils/bed/bed.view.constants';
import { dismissHoverTooltips } from '../../utils/browser/dismiss.hover.tooltips';
import { TOOLTIP_HOLD_ATTRIBUTE } from '../../utils/layout.constants';
import { BedViewModeChanged } from '../../utils/states/bed.view.state';
import { NarrowRegionChanged } from '../../utils/states/ui.workbench.state';
import { WORKBENCH_REGION } from '../../utils/states/workbench.region.constants';
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

  it('closes the hover tooltips when a card scrolls, telling the element last entered on a touch screen', () => {
    const cardElement: HTMLDivElement = document.createElement('div');

    document.body.append(cardElement);
    renderDismissal(newStore());

    fireEvent.mouseOver(cardElement);
    fireEvent.scroll(cardElement);

    expect(dismissHoverTooltips).toHaveBeenCalledWith(cardElement);
    cardElement.remove();
  });

  it('closes the hover tooltips when the bed view changes', () => {
    const store: AppStore = newStore();

    renderDismissal(store);
    act(() => {
      store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.THREE_D }));
    });

    expect(dismissHoverTooltips).toHaveBeenCalledTimes(1);
  });

  it('closes the hover tooltips on a region switch and holds them back until the pointer moves', () => {
    const store: AppStore = newStore();

    renderDismissal(store);
    act(() => {
      store.dispatch(new NarrowRegionChanged({ narrowRegion: WORKBENCH_REGION.JOB }));
    });

    expect(dismissHoverTooltips).toHaveBeenCalledTimes(1);
    expect(document.documentElement.hasAttribute(TOOLTIP_HOLD_ATTRIBUTE)).toBe(true);

    fireEvent.pointerMove(window, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { clientX: 11, clientY: 10 });
    expect(document.documentElement.hasAttribute(TOOLTIP_HOLD_ATTRIBUTE)).toBe(true);

    fireEvent.pointerMove(window, { clientX: 40, clientY: 40 });
    expect(document.documentElement.hasAttribute(TOOLTIP_HOLD_ATTRIBUTE)).toBe(false);
  });

  it('closes and holds the tooltips when the tab is hidden or shown', () => {
    renderDismissal(newStore());

    fireEvent(document, new Event('visibilitychange'));

    expect(dismissHoverTooltips).toHaveBeenCalledTimes(1);
    expect(document.documentElement.hasAttribute(TOOLTIP_HOLD_ATTRIBUTE)).toBe(true);
  });
});
